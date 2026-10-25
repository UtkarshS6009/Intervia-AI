from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid
from app.database.database import get_db
from app.database.models import Resume, CandidateProfile
from app.services.resume_parser import ResumeParserService
from app.ai.llm import LLMProvider

router = APIRouter(prefix="/api/resume", tags=["Resume"])
llm = LLMProvider()

# Pydantic schema to match the frontend JSON request exactly
class ResumeUploadRequest(BaseModel):
    text: str
    filename: Optional[str] = "Candidate_Resume.pdf"
    targetRole: Optional[str] = "Software Engineer"
    userId: Optional[str] = "demo-user-1"

@router.post("/upload")
def upload_resume(request: ResumeUploadRequest, db: Session = Depends(get_db)):
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Resume text is required.")
        
    try:
        # 1. Save Raw Resume to DB
        resume_record = Resume(
            id=f"res_{uuid.uuid4().hex[:12]}",
            user_id=request.userId,
            file_path=request.filename,
            raw_text=request.text
        )
        db.add(resume_record)
        
        # 2. LLM Extraction & ATS Scoring
        system_prompt = "You are an expert ATS and HR intelligence system. Extract structured data and calculate an ATS score out of 100 based on keyword match, formatting, and project impact."
        prompt = f"""
        Target Role: {request.targetRole}
        Resume:
        {request.text[:4000]}
        
        Extract the candidate's data and return STRICT JSON exactly matching this template:
        {{
          "skills": [{{"name": "Python", "category": "Programming"}}],
          "projects": [{{"title": "Project Name", "description": "Brief description", "techStack": ["Python"]}}],
          "experience": [{{"role": "Title", "company": "Company", "duration": "2020-2021", "details": ["Responsibility"]}}],
          "education": [{{"degree": "B.S. CS", "institution": "University", "year": "2020"}}],
          "atsScore": 85,
          "atsBreakdown": {{
            "keywordMatch": 90,
            "formatting": 80,
            "projectImpact": 85,
            "experienceRelevance": 80,
            "missingKeywords": ["Docker"],
            "recommendations": ["Add metrics"]
          }}
        }}
        """
        
        extracted_data = llm.generate_json(prompt, system_prompt)
        
        if "error" in extracted_data:
            raise HTTPException(status_code=500, detail="AI extraction failed")
            
        # 3. Save Profile to DB
        profile_record = CandidateProfile(
            id=f"prof_{uuid.uuid4().hex[:12]}",
            user_id=request.userId,
            skills=extracted_data.get("skills", []),
            projects=extracted_data.get("projects", []),
            experience=extracted_data.get("experience", []),
            education=extracted_data.get("education", [])
        )
        db.add(profile_record)
        db.commit()
        
        return {
            "success": True,
            "profile": {
                "id": profile_record.id,
                "skills": profile_record.skills,
                "projects": profile_record.projects,
                "experience": profile_record.experience,
                "education": profile_record.education
            },
            "atsScore": extracted_data.get("atsScore", 75),
            "atsBreakdown": extracted_data.get("atsBreakdown", {})
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile")
def get_profile(userId: str = "demo-user-1", db: Session = Depends(get_db)):
    # Fetch the most recent profile for the user
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == userId).order_by(CandidateProfile.id.desc()).first()
    
    if not profile:
        # Graceful fallback for new users who haven't uploaded a resume yet
        return {
            "profile": {
                "id": "empty",
                "skills": [],
                "projects": [],
                "experience": [],
                "education": [],
                "atsScore": 0,
                "atsBreakdown": {}
            }
        }
        
    # Return the profile mapped to the frontend's expected structure
    return {
        "profile": {
            "id": profile.id,
            "skills": profile.skills,
            "projects": profile.projects,
            "experience": profile.experience,
            "education": profile.education,
            "atsScore": 84,
            "atsBreakdown": {
                "keywordMatch": 86,
                "formatting": 92,
                "projectImpact": 88,
                "experienceRelevance": 82,
                "missingKeywords": ["Docker", "CI/CD"],
                "recommendations": ["Add measurable metrics"]
            }
        }
    }

@router.post("/parse_pdf")
async def parse_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        content = await file.read()
        text = ResumeParserService.extract_text_from_pdf(content)
        
        if not text or len(text.strip()) == 0:
            raise Exception("No readable text found. The PDF might be an image-only scan.")
            
        return {"text": text}
        
    except Exception as e:
        print(f"Backend PDF Error: {str(e)}") # This will print the exact error to your terminal
        raise HTTPException(status_code=500, detail=f"PDF parsing failed: {str(e)}")