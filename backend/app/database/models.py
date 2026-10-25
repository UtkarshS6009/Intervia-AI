from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    profiles = relationship("CandidateProfile", back_populates="user")
    sessions = relationship("InterviewSession", back_populates="user")
    roadmaps = relationship("LearningRoadmap", back_populates="user")

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    file_path = Column(String, nullable=True)
    raw_text = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    skills = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    education = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    
    user = relationship("User", back_populates="profiles")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    category = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    mode = Column(String, nullable=False) 
    company = Column(String, nullable=True)
    status = Column(String, default="in_progress")
    total_questions = Column(Integer, default=5)
    current_question_index = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    overall_score = Column(Float, nullable=True)
    
    user = relationship("User", back_populates="sessions")
    questions = relationship("Question", back_populates="session", order_by="Question.id")

class Question(Base):
    __tablename__ = "questions"
    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("interview_sessions.id"))
    question = Column(String, nullable=False)
    category = Column(String, nullable=False)
    topic = Column(String, nullable=True)
    difficulty = Column(String, nullable=False)
    expected_concepts = Column(JSON, default=list)
    sample_answer = Column(String, nullable=True)
    
    session = relationship("InterviewSession", back_populates="questions")
    answer = relationship("Answer", back_populates="question", uselist=False)

class Answer(Base):
    __tablename__ = "answers"
    id = Column(String, primary_key=True, index=True)
    question_id = Column(String, ForeignKey("questions.id"))
    answer_text = Column(String, nullable=False)
    audio_path = Column(String, nullable=True)
    
    question = relationship("Question", back_populates="answer")
    evaluation = relationship("Evaluation", back_populates="answer", uselist=False)

class Evaluation(Base):
    __tablename__ = "evaluations"
    id = Column(String, primary_key=True, index=True)
    answer_id = Column(String, ForeignKey("answers.id"))
    overall_score = Column(Float, nullable=False)
    correctness = Column(Float, nullable=False)
    technical_depth = Column(Float, nullable=False)
    completeness = Column(Float, nullable=False)
    communication = Column(Float, nullable=False)
    clarity = Column(Float, nullable=False)
    feedback = Column(String, nullable=False)
    
    answer = relationship("Answer", back_populates="evaluation")

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    target_role = Column(String, nullable=False)
    roadmap_data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="roadmaps")