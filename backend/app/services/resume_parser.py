import pdfplumber
import io
import re
import logging

logger = logging.getLogger(__name__)

class ResumeParserService:
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        """Extracts text reliably using pdfplumber."""
        text = ""
        try:
            # pdfplumber reads directly from the byte stream without crashing on Windows
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
                        
            clean_text = text.strip()
            
            # Clean up excessive whitespace and invisible characters
            clean_text = re.sub(r'\s+', ' ', clean_text)
            clean_text = re.sub(r'[^\x00-\x7F]+', ' ', clean_text)
            
            return clean_text.strip()
            
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            raise Exception(f"Failed to read PDF file: {str(e)}")