from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import subprocess
import tempfile
import os

from ..ai.llm import LLMProvider

router = APIRouter(prefix="/api/coding", tags=["Coding"])
llm = LLMProvider()

class CodeSubmission(BaseModel):
    code: str
    language: str = "python"
    problemId: str = "two-sum"

@router.post("/execute")
def execute_and_evaluate(sub: CodeSubmission):
    if sub.language.lower() not in ["python", "python3"]:
        raise HTTPException(status_code=400, detail="Only Python is supported in the local MVP sandbox.")
        
    # 1. Inject hidden unit tests to verify logic
    test_injection = """\n
# --- Auto-Injected Test Runner ---
try:
    if 'Solution' in globals():
        sol = Solution()
        if hasattr(sol, 'twoSum'):
            assert sorted(sol.twoSum([2,7,11,15], 9)) == [0,1], "Test 1 Failed: nums=[2,7,11,15], target=9"
            assert sorted(sol.twoSum([3,2,4], 6)) == [1,2], "Test 2 Failed: nums=[3,2,4], target=6"
            print("EXECUTION_SUCCESS: All unit tests passed.")
        else:
            print("EXECUTION_ERROR: No twoSum method found on Solution class.")
    else:
        print("EXECUTION_WARNING: Code executed, but no Solution class found to test.")
except AssertionError as ae:
    print(f"EXECUTION_FAILED: {ae}")
except Exception as e:
    print(f"EXECUTION_ERROR: {e}")
"""
    
    full_code = sub.code + (test_injection if sub.problemId == "two-sum" else "\nprint('Executed successfully.')")
    
    stdout_output = ""
    stderr_output = ""
    is_success = False
    
    # 2. Run the code in a secure local subprocess
    try:
        # Create a temporary file to hold the candidate's code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(full_code)
            temp_filename = f.name
            
        # Execute with a strict 3-second timeout to prevent infinite loops (OOM/CPU lock)
        process = subprocess.run(["python", temp_filename], capture_output=True, text=True, timeout=3)
        stdout_output = process.stdout.strip()
        stderr_output = process.stderr.strip()
        
        # Determine if the logic actually passed the tests
        is_success = process.returncode == 0 and ("EXECUTION_SUCCESS" in stdout_output or sub.problemId != "two-sum")
        
        os.remove(temp_filename)
        
    except subprocess.TimeoutExpired:
        stderr_output = "TimeoutError: Execution exceeded 3 seconds. Check for infinite loops."
        os.remove(temp_filename)
        
    # 3. Pass Execution Realities to the LLM for Big-O & Rubric Analysis
    system_prompt = "You are a Senior Staff Engineer evaluating a candidate's coding interview submission. Return strict JSON."
    prompt = f"""
    Problem: {sub.problemId}
    Candidate Code:
    {sub.code}
    
    Actual Subprocess Execution Output:
    STDOUT: {stdout_output}
    STDERR: {stderr_output}
    
    Analyze the code and the raw execution results. Return STRICT JSON exactly matching this schema:
    {{
        "isCorrect": {str(is_success).lower()},
        "timeComplexity": "O(N) etc",
        "spaceComplexity": "O(N) etc",
        "executionOutput": "{stdout_output if stdout_output else stderr_output}",
        "feedback": "A concise explanation of why it passed/failed based on the STDOUT/STDERR logs, and a note on code quality.",
        "optimizationHint": "A one-sentence tip to improve Big-O or readability.",
        "score": 90
    }}
    """
    
    # Let the LLM synthesize the final scorecard
    llm_result = llm.generate_json(prompt, system_prompt)
    
    return {
        "success": True,
        "evaluation": {
            "isCorrect": is_success,
            "timeComplexity": llm_result.get("timeComplexity", "O(N)"),
            "spaceComplexity": llm_result.get("spaceComplexity", "O(N)"),
            "executionOutput": stdout_output if stdout_output else stderr_output,
            "feedback": llm_result.get("feedback", "Execution completed."),
            "optimizationHint": llm_result.get("optimizationHint", ""),
            "score": llm_result.get("score", 100 if is_success else 40)
        }
    }