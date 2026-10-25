from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.database.database import get_db
from app.database.models import Question, Answer, Evaluation
from app.ai.llm import LLMProvider

router = APIRouter(prefix="/api/evaluation", tags=["Evaluation"])
llm = LLMProvider()

class AnswerSubmission(BaseModel):
    session_id: str
    question_id: str
    answer_text: str

@router.post("/evaluate")
def evaluate_answer(sub: AnswerSubmission, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == sub.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    # Save Candidate Answer
    answer_record = Answer(
        id=f"ans_{uuid.uuid4().hex[:12]}",
        question_id=sub.question_id,
        answer_text=sub.answer_text
    )
    db.add(answer_record)
    
    # Generate AI Evaluation
    system_prompt = "You are a Principal Technical Interviewer evaluating a candidate's answer against a strict technical rubric. Grade strictly and objectively."
    prompt = f"""
    Question: {question.question}
    Expected Concepts: {', '.join(question.expected_concepts)}
    Candidate Answer: {sub.answer_text}
    
    Return STRICT JSON: 'overallScore' (0-100), 'correctness', 'technicalDepth', 'completeness', 'communication', 'clarity', 'strengths' (list), 'weaknesses' (list), 'missingConcepts' (list), 'feedback', 'improvedAnswer'.
    """
    
    eval_result = llm.generate_json(prompt, system_prompt)
    
    if "error" in eval_result:
        raise HTTPException(status_code=500, detail="Evaluation engine failed")
        
    # Save Evaluation
    evaluation_record = Evaluation(
        id=f"eval_{uuid.uuid4().hex[:12]}",
        answer_id=answer_record.id,
        overall_score=eval_result.get("overallScore", 0),
        correctness=eval_result.get("correctness", 0),
        technical_depth=eval_result.get("technicalDepth", 0),
        completeness=eval_result.get("completeness", 0),
        communication=eval_result.get("communication", 0),
        clarity=eval_result.get("clarity", 0),
        feedback=eval_result.get("feedback", "")
    )
    db.add(evaluation_record)
    db.commit()
    
    return {"success": True, "evaluation": eval_result}