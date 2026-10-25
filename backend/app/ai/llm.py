import os
import json
import logging
import requests
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class LLMProvider:
    """Multi-provider abstraction for Gemini, Ollama, and Groq."""
    
    def __init__(self, provider: Optional[str] = None):
        self.provider = provider or os.getenv("DEFAULT_LLM_PROVIDER", "gemini").lower()
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.ollama_base = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "qwen2.5")
        self.groq_key = os.getenv("GROQ_API_KEY", "")

    def generate_json(self, prompt: str, system_prompt: str = "") -> Dict[str, Any]:
        """Calls the configured provider and guarantees structured JSON output."""
        if self.provider == "gemini" and self.gemini_key:
            try:
                return self._call_gemini(prompt, system_prompt)
            except Exception as e:
                logger.warning(f"Gemini call failed ({e}), attempting Ollama fallback...")
        
        if self.provider == "ollama" or not self.gemini_key:
            try:
                return self._call_ollama(prompt, system_prompt)
            except Exception as e:
                logger.warning(f"Ollama call failed ({e}), attempting Groq...")
                
        if self.groq_key:
            return self._call_groq(prompt, system_prompt)

        return {"error": "No LLM provider responded successfully"}

    def _call_gemini(self, prompt: str, system_prompt: str) -> Dict[str, Any]:
        import google.genai as genai
        client = genai.Client(api_key=self.gemini_key)
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=f"{system_prompt}\n\n{prompt}",
            config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)

    def _call_ollama(self, prompt: str, system_prompt: str) -> Dict[str, Any]:
        url = f"{self.ollama_base}/api/generate"
        payload = {
            "model": self.ollama_model,
            "prompt": f"{system_prompt}\n\n{prompt}",
            "format": "json",
            "stream": False
        }
        res = requests.post(url, json=payload, timeout=300)
        res.raise_for_status()
        body = res.json()
        return json.loads(body.get("response", "{}"))

    def _call_groq(self, prompt: str, system_prompt: str) -> Dict[str, Any]:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.groq_key}"}
        payload = {
            "model": "llama-3.1-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"}
        }
        res = requests.post(url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        data = res.json()
        content = data["choices"][0]["message"]["content"]
        return json.loads(content)
