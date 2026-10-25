import json
import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        self.index = None
        self.questions = []
        self._initialize_knowledge_base()

    def _initialize_knowledge_base(self):
        """Loads curated questions and builds the FAISS index."""
        kb_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/interview_questions.json"))
        
        if not os.path.exists(kb_path):
            logger.warning(f"Knowledge base not found at {kb_path}")
            return
            
        with open(kb_path, 'r', encoding='utf-8') as f:
            self.questions = json.load(f)
            
        # Combine question text and expected concepts for richer semantic embeddings
        texts = [
            f"{q.get('topic', '')} {q.get('question', '')} " + " ".join(q.get("expected_concepts", [])) 
            for q in self.questions
        ]
        
        if texts:
            logger.info(f"Generating embeddings for {len(texts)} questions...")
            embeddings = self.embedder.encode(texts, convert_to_numpy=True).astype('float32')
            
            # Initialize FAISS L2 distance index
            dimension = embeddings.shape[1]
            self.index = faiss.IndexFlatL2(dimension)
            self.index.add(embeddings)
            logger.info("FAISS index built successfully.")

    def retrieve_questions(self, category: str, target_role: str, k: int = 5):
        """Retrieves the most semantically relevant questions for the role and category."""
        if not self.index or not self.questions:
            return []
            
        query = f"Interview questions for {target_role} focusing on {category}"
        query_emb = self.embedder.encode([query], convert_to_numpy=True).astype('float32')
        
        # Search for 3x the requested amount to allow for category filtering
        distances, indices = self.index.search(query_emb, k * 3)
        
        results = []
        for idx in indices[0]:
            if idx < len(self.questions):
                q = self.questions[idx]
                # Filter by requested category (or allow all if Mixed)
                if category.lower() == "mixed" or q.get("category", "").lower() == category.lower():
                    if q not in results:
                        results.append(q)
                    if len(results) == k:
                        break
        
        # Fallback if strict category matching yields too few results
        if len(results) < k:
            for idx in indices[0]:
                q = self.questions[idx]
                if q not in results:
                    results.append(q)
                if len(results) == k:
                    break
                    
        return results