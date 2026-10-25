from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

from app.database.database import get_db
from app.database.models import InterviewSession, Question, Answer, Evaluation
from app.services.rag_service import RAGService
from app.ai.llm import LLMProvider

router = APIRouter(prefix="/api/interview", tags=["Interview"])
rag_service = RAGService()
llm = LLMProvider()

class InterviewConfig(BaseModel):
    userId: Optional[str] = "demo-user-1"
    category: str
    difficulty: str
    mode: str
    targetRole: str
    company: Optional[str] = "Standard"
    totalQuestions: int = 5

class AnswerSubmission(BaseModel):
    answer: str

@router.post("/create")
def create_interview(config: InterviewConfig, db: Session = Depends(get_db)):
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    
    # Retrieve semantic questions using FAISS
    questions_data = rag_service.retrieve_questions(
        category=config.category,
        target_role=config.targetRole,
        k=config.totalQuestions
    )
    
    if not questions_data:
        raise HTTPException(status_code=500, detail="Failed to retrieve knowledge base questions.")

    new_session = InterviewSession(
        id=session_id,
        user_id=config.userId,
        category=config.category,
        difficulty=config.difficulty,
        mode=config.mode,
        company=config.company,
        total_questions=len(questions_data),
        current_question_index=0,
        status="in_progress"
    )
    db.add(new_session)
    
    # Pre-populate session questions
    db_questions = []
    for i, q in enumerate(questions_data):
        db_q = Question(
            id=f"q_{session_id}_{i}",
            session_id=session_id,
            question=q.get("question"),
            category=q.get("category", config.category),
            topic=q.get("topic", "Technical"),
            difficulty=q.get("difficulty", config.difficulty),
            expected_concepts=q.get("expected_concepts", []),
            sample_answer=q.get("sample_answer", "")
        )
        db.add(db_q)
        db_questions.append(db_q)
        
    db.commit()
    
    return {
        "sessionId": session_id,
        "session": {
            "id": session_id,
            "category": new_session.category,
            "difficulty": new_session.difficulty,
            "mode": new_session.mode,
            "company": new_session.company,
            "totalQuestions": new_session.total_questions,
            "currentQuestionIndex": new_session.current_question_index,
            "status": new_session.status
        },
        "firstQuestion": {
            "id": db_questions[0].id,
            "question": db_questions[0].question,
            "topic": db_questions[0].topic,
            "difficulty": db_questions[0].difficulty,
            "expectedConcepts": db_questions[0].expected_concepts,
            "sampleAnswer": db_questions[0].sample_answer
        }
    }

@router.get("/{session_id}/question")
def get_current_question(session_id: str, db: Session = Depends(get_db)):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.current_question_index >= len(session.questions):
        raise HTTPException(status_code=400, detail="Interview already completed")
        
    current_q = session.questions[session.current_question_index]
    
    return {
        "session": {
            "id": session.id,
            "category": session.category,
            "difficulty": session.difficulty,
            "mode": session.mode,
            "company": session.company,
            "totalQuestions": session.total_questions,
            "currentQuestionIndex": session.current_question_index,
            "status": session.status
        },
        "question": {
            "id": current_q.id,
            "question": current_q.question,
            "topic": current_q.topic,
            "difficulty": current_q.difficulty,
            "expectedConcepts": current_q.expected_concepts,
            "sampleAnswer": current_q.sample_answer
        }
    }

@router.post("/{session_id}/answer")
def submit_answer(session_id: str, sub: AnswerSubmission, db: Session = Depends(get_db)):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    current_q = session.questions[session.current_question_index]
    
    # Save candidate's raw answer
    answer_record = Answer(
        id=f"ans_{uuid.uuid4().hex[:12]}",
        question_id=current_q.id,
        answer_text=sub.answer
    )
    db.add(answer_record)
    
    # Generate strict AI Evaluation
    system_prompt = "You are a Principal Technical Interviewer evaluating a candidate's answer against a strict technical rubric. Grade strictly and objectively. Return JSON only."
    prompt = f"""
    Question: {current_q.question}
    Expected Concepts: {', '.join(current_q.expected_concepts)}
    Candidate Answer: {sub.answer}
    
    Return STRICT JSON exactly matching:
    {{
      "overallScore": int, "correctness": int, "technicalDepth": int, "completeness": int, 
      "communication": int, "clarity": int, "strengths": [], "weaknesses": [], 
      "missingConcepts": [], "feedback": "str", "improvedAnswer": "str"
    }}
    """
    
    eval_result = llm.generate_json(prompt, system_prompt)
    if "error" in eval_result:
        raise HTTPException(status_code=500, detail="Evaluation engine failed")
        
    # Persist the evaluation
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
    
    return {"success": True, "evaluation": eval_result, "question": current_q.question}

@router.post("/{session_id}/next")
def advance_question(session_id: str, db: Session = Depends(get_db)):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.current_question_index += 1
    
    if session.current_question_index >= session.total_questions:
        session.status = "completed"
        session.completed_at = datetime.utcnow()
        
        # Calculate aggregate final score
        evaluations = db.query(Evaluation).join(Answer).join(Question).filter(Question.session_id == session_id).all()
        if evaluations:
            session.overall_score = round(sum(e.overall_score for e in evaluations) / len(evaluations))
        else:
            session.overall_score = 0
            
        db.commit()
        return {"completed": True, "session": {"id": session.id, "overallScore": session.overall_score}}
        
    db.commit()
    next_q = session.questions[session.current_question_index]
    
    return {
        "completed": False,
        "currentQuestionIndex": session.current_question_index,
        "totalQuestions": session.total_questions,
        "nextQuestion": {
            "id": next_q.id,
            "question": next_q.question,
            "topic": next_q.topic,
            "difficulty": next_q.difficulty,
            "expectedConcepts": next_q.expected_concepts
        }
    }

@router.get("/{session_id}/results")
def get_results(session_id: str, db: Session = Depends(get_db)):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    
    if not session:
        # Graceful fallback for the hardcoded React dashboard dummy data
        if session_id == "session-history-1":
            return {
                "session": {"category": "Machine Learning", "company": "Google", "overallScore": 82},
                "aggregateScores": {"overall": 82, "correctness": 85, "technicalDepth": 80, "completeness": 80, "communication": 85, "clarity": 85},
                "strengths": ["Clear breakdown of the accuracy paradox."],
                "weaknesses": ["Missed Focal Loss trade-offs."],
                "missingConcepts": ["Focal Loss"],
                "questions": []
            }
        raise HTTPException(status_code=404, detail="Session not found")
        
        
    questions_data = []
    strengths, weaknesses, missing_concepts = [], [], []
    evaluations = []
    
    for q in session.questions:
        ans = q.answer
        ev = ans.evaluation if ans else None
        
        if ev:
            evaluations.append(ev)
            # Fetch strings manually since SQLite stores them slightly differently depending on JSON implementation
            # We mock the arrays here for frontend compatibility if actual DB JSON parsing is complex in MVP
            strengths.append(f"Answered {q.topic} well") if ev.overall_score > 70 else None
            weaknesses.append(f"Needs review on {q.topic}") if ev.overall_score <= 70 else None
            
        questions_data.append({
            "question": q.question,
            "topic": q.topic,
            "difficulty": q.difficulty,
            "userAnswer": ans.answer_text if ans else "",
            "evaluation": {
                "overallScore": ev.overall_score if ev else 0,
                "feedback": ev.feedback if ev else "",
            } if ev else None
        })
        
    agg = {
        "overall": session.overall_score or 0,
        "correctness": round(sum(e.correctness for e in evaluations) / len(evaluations)) if evaluations else 0,
        "technicalDepth": round(sum(e.technical_depth for e in evaluations) / len(evaluations)) if evaluations else 0,
        "completeness": round(sum(e.completeness for e in evaluations) / len(evaluations)) if evaluations else 0,
        "communication": round(sum(e.communication for e in evaluations) / len(evaluations)) if evaluations else 0,
        "clarity": round(sum(e.clarity for e in evaluations) / len(evaluations)) if evaluations else 0,
    }
    
    return {
        "session": {"category": session.category, "company": session.company, "overallScore": session.overall_score},
        "aggregateScores": agg,
        "strengths": strengths[:5],
        "weaknesses": weaknesses[:5],
        "missingConcepts": missing_concepts[:6],
        "questions": questions_data
    }