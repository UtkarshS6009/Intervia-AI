import base64
import tempfile
import os
import logging
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

class SpeechService:
    def __init__(self, model_size="tiny.en"):
        # "tiny.en" or "base.en" are recommended for fast local MVP performance on CPU
        logger.info(f"Loading faster-whisper model '{model_size}'...")
        try:
            self.model = WhisperModel(model_size, device="cpu", compute_type="int8")
        except Exception as e:
            logger.error(f"Failed to load WhisperModel: {e}")
            self.model = None

    def transcribe_audio_base64(self, audio_b64: str) -> str:
        """Decodes base64 audio and transcribes it using faster-whisper."""
        if not self.model:
            return "Speech recognition model is currently unavailable on the server."
            
        # Strip the data URI prefix if present (e.g., "data:audio/webm;base64,")
        if "," in audio_b64:
            audio_b64 = audio_b64.split(",")[1]

        try:
            audio_data = base64.b64decode(audio_b64)
            
            # Write to a temporary file for Whisper to process
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_file:
                tmp_file.write(audio_data)
                tmp_filepath = tmp_file.name

            segments, info = self.model.transcribe(tmp_filepath, beam_size=5)
            
            transcript = " ".join([segment.text for segment in segments])
            
            # Clean up temporary file
            os.remove(tmp_filepath)
            
            return transcript.strip()
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return "Error transcribing audio."