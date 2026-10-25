from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm.attributes import flag_modified

from ..database.database import get_db
from ..database.models import LearningRoadmap
from ..services.roadmap_service import RoadmapService

router = APIRouter(prefix="/api/roadmap", tags=["Roadmap"])
roadmap_service = RoadmapService()

# 1. Schemas mapping exactly to the React frontend's camelCase JSON payloads
class RoadmapGenerateRequest(BaseModel):
    targetRole: str
    weakTopics: Optional[List[str]] = []
    userId: Optional[str] = "demo-user-1"

class ToggleRequest(BaseModel):
    dayNumber: int
    userId: Optional[str] = "demo-user-1"


# 2. Endpoints
@router.post("/generate")
def generate_roadmap(request: RoadmapGenerateRequest, db: Session = Depends(get_db)):
    try:
        # Ask LLM to build the curriculum
        roadmap_data = roadmap_service.generate_personalized_roadmap(
            target_role=request.targetRole,
            weak_topics=request.weakTopics,
            user_id=request.userId
        )
        
        # Save generated roadmap to PostgreSQL
        db_roadmap = LearningRoadmap(
            id=roadmap_data["id"],
            user_id=request.userId,
            target_role=request.targetRole,
            roadmap_data=roadmap_data
        )
        db.add(db_roadmap)
        db.commit()
        
        return {"roadmap": roadmap_data}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
@router.get("/")
def get_roadmap(userId: str = "demo-user-1", db: Session = Depends(get_db)):
    roadmap_record = db.query(LearningRoadmap).filter(LearningRoadmap.user_id == userId).order_by(LearningRoadmap.created_at.desc()).first()
    
    if not roadmap_record:
        # Return a graceful default skeleton instead of a 404 error
        return {"roadmap": {
            "id": "default-roadmap",
            "targetRole": "Software Engineer",
            "weakTopics": ["System Design", "Dynamic Programming"],
            "weeks": [{
                "weekNumber": 1,
                "theme": "Core Fundamentals",
                "description": "Getting started with priority topics.",
                "days": [{
                    "day": 1,
                    "title": "Welcome to your Roadmap",
                    "topic": "Getting Started",
                    "category": "General",
                    "priority": "High",
                    "estimatedHours": 1.0,
                    "tasks": ["Generate a new roadmap to see personalized tasks!"],
                    "resources": [],
                    "completed": False
                }]
            }]
        }}
        
    return {"roadmap": roadmap_record.roadmap_data}


@router.post("/toggle")
def toggle_day(request: ToggleRequest, db: Session = Depends(get_db)):
    # Fetch user's active roadmap
    roadmap_record = db.query(LearningRoadmap).filter(LearningRoadmap.user_id == request.userId).order_by(LearningRoadmap.created_at.desc()).first()
    
    if not roadmap_record:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    # Traverse the JSON structure to find the specific day and toggle its "completed" status
    data = dict(roadmap_record.roadmap_data)
    day_found = False
    
    for week in data.get("weeks", []):
        for day in week.get("days", []):
            if day.get("day") == request.dayNumber:
                day["completed"] = not day.get("completed", False)
                day_found = True
                break
        if day_found:
            break
            
    if not day_found:
        raise HTTPException(status_code=404, detail="Day not found in roadmap")
        
    # Inform SQLAlchemy that the JSON column was modified so it commits the change
    roadmap_record.roadmap_data = data
    flag_modified(roadmap_record, "roadmap_data")
    db.commit()
    
    return {"success": True}