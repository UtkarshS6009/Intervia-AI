from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any

from app.database.database import get_db
from app.database.models import InterviewSession, Evaluation

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/overview")
def get_dashboard_overview(user_id: str = "demo-user-1", db: Session = Depends(get_db)):
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user_id,
        InterviewSession.status == "completed"
    ).all()
    
    total_interviews = len(sessions)
    if total_interviews == 0:
        return {
            "totalInterviews": 0, "averageScore": 0, "bestScore": 0,
            "improvementRate": "N/A", "recentInterviews": []
        }
        
    scores = [s.overall_score for s in sessions if s.overall_score is not None]
    average_score = round(sum(scores) / len(scores)) if scores else 0
    best_score = max(scores) if scores else 0
    
    recent = sorted(sessions, key=lambda x: x.started_at, reverse=True)[:5]
    
    return {
        "totalInterviews": total_interviews,
        "averageScore": average_score,
        "bestScore": best_score,
        "improvementRate": "+12% this month", # In production: calculate based on time series
        "recentInterviews": [{
            "id": s.id,
            "category": s.category,
            "difficulty": s.difficulty,
            "date": s.started_at.isoformat(),
            "score": s.overall_score,
            "status": s.status,
            "company": s.company
        } for s in recent]
    }

@router.get("/analytics")
def get_dashboard_analytics(user_id: str = "demo-user-1", db: Session = Depends(get_db)):
    # In a full production environment, these aggregates would be complex SQL queries.
    # For MVP, we return a structured analytical payload that matches the frontend charts.
    return {
        "scoreTrend": [
            {"date": "Week 1", "score": 65, "benchmark": 70},
            {"date": "Week 2", "score": 72, "benchmark": 72},
            {"date": "Week 3", "score": 78, "benchmark": 74},
            {"date": "Week 4", "score": 85, "benchmark": 75}
        ],
        "skillRadar": [
            {"skill": "Correctness", "score": 88, "fullMark": 100},
            {"skill": "Tech Depth", "score": 82, "fullMark": 100},
            {"skill": "Completeness", "score": 76, "fullMark": 100},
            {"skill": "Communication", "score": 90, "fullMark": 100},
            {"skill": "Clarity", "score": 84, "fullMark": 100},
            {"skill": "System Design", "score": 72, "fullMark": 100}
        ],
        "categoryPerformance": [
            {"category": "Machine Learning", "score": 88},
            {"category": "Python", "score": 84},
            {"category": "System Design", "score": 68}
        ]
    }