from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- User & Auth Schemas ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    target_role: Optional[str] = "Software Engineer"
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    target_role: str
    created_at: datetime
    class Config:
        from_attributes = True

# --- Candidate Profile Schemas ---
class SkillSchema(BaseModel):
    name: str
    category: str

class ProjectSchema(BaseModel):
    title: str
    description: str
    techStack: List[str]

class CandidateProfileResponse(BaseModel):
    id: str
    user_id: str
    skills: List[SkillSchema]
    projects: List[ProjectSchema]
    experience: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    certifications: List[str]
    class Config:
        from_attributes = True

# --- Evaluation Schemas ---
class EvaluationResult(BaseModel):
    overallScore: int
    correctness: int
    technicalDepth: int
    completeness: int
    communication: int
    clarity: int
    strengths: List[str]
    weaknesses: List[str]
    missingConcepts: List[str]
    feedback: str
    improvedAnswer: str

# --- Roadmap Schemas ---
class RoadmapGenerateRequest(BaseModel):
    user_id: Optional[str] = "demo-user-1"
    target_role: str
    weak_topics: List[str]

class RoadmapItemSchema(BaseModel):
    day: int
    title: str
    topic: str
    category: str
    priority: str
    estimatedHours: float
    tasks: List[str]
    resources: List[Dict[str, str]]
    completed: bool = False

class RoadmapWeekSchema(BaseModel):
    weekNumber: int
    theme: str
    description: str
    days: List[RoadmapItemSchema]

class LearningRoadmapResponse(BaseModel):
    id: str
    user_id: str
    targetRole: str
    weakTopics: List[str]
    weeks: List[RoadmapWeekSchema]
    createdAt: datetime