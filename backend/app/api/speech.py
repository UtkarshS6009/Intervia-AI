from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.speech_service import SpeechService

router = APIRouter(prefix="/api/speech", tags=["Speech"])
speech_service = SpeechService()

class TranscriptionRequest(BaseModel):
    audioBase64: str
    mimeType: Optional[str] = 'audio/webm'

@router.post("/transcribe")
def transcribe_audio(request: TranscriptionRequest):
    if not request.audioBase64:
        raise HTTPException(status_code=400, detail="Audio base64 payload is required")
        
    transcript = speech_service.transcribe_audio_base64(request.audioBase64)
    return {"transcript": transcript}