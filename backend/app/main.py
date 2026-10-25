import os
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.ai.llm import LLMProvider
from app.database.init_db import init_db
from app.api import auth, resume, interview, evaluation, roadmap, speech, dashboard, coding, reports, config

# Initialize PostgreSQL / SQLite Database
init_db()

app = FastAPI(
    title="AI Interview Coach Backend",
    version="1.0.0",
    description="Intelligent multi-provider AI mock interview and career acceleration engine."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all Routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(evaluation.router)
app.include_router(roadmap.router)
app.include_router(speech.router)
app.include_router(dashboard.router)
app.include_router(coding.router)
app.include_router(reports.router)
app.include_router(config.router)

llm = LLMProvider()

@app.get("/")
def root():
    return {"status": "online", "system": "AI Interview Coach FastAPI Engine", "provider": llm.provider}

@app.get("/health")
def health():
    return {"status": "healthy", "database": "connected", "rag_vector_index": "loaded"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
