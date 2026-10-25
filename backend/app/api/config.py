from fastapi import APIRouter
import os

router = APIRouter(prefix="/api/config", tags=["Configuration"])

@router.get("/providers")
def get_providers():
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    groq_key = os.getenv("GROQ_API_KEY", "")
    
    return {
        "gemini": {
            "available": bool(gemini_key),
            "model": "gemini-3.8-flash",
            "status": "ready" if gemini_key else "missing_key",
        },
        "ollama": {
            "available": True,
            "defaultUrl": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            "recommendedModel": os.getenv("OLLAMA_MODEL", "qwen2.5"),
            "status": "configured",
        },
        "groq": {
            "available": bool(groq_key),
            "status": "ready" if groq_key else "optional",
        },
    }