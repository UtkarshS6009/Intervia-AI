import uuid
from typing import List
import logging
from datetime import datetime
from app.ai.llm import LLMProvider
from app.schemas.schemas import LearningRoadmapResponse

logger = logging.getLogger(__name__)

class RoadmapService:
    def __init__(self):
        self.llm = LLMProvider()

    def generate_personalized_roadmap(self, target_role: str, weak_topics: List[str], user_id: str) -> dict:
        """Calls the LLM to generate a structured 30-day study plan."""
        
        system_prompt = (
            "You are a Principal Engineering Career Coach. Build a personalized 30-Day Learning "
            "Roadmap for a candidate based on their target role and identified weak areas. "
            "Return STRICT JSON matching the required schema."
        )
        
        prompt = f"""
        Candidate Target Role: {target_role}
        Weak Topics to Target: {', '.join(weak_topics)}
        
        Requirements:
        - Structure into exactly 4 cohesive weeks.
        - Include 3 to 5 actionable study days per week.
        - Curate real, authoritative learning resources (e.g. official docs, LeetCode).
        
        Return STRICT JSON with this exact schema:
        {{
          "weeks": [
            {{
              "weekNumber": 1,
              "theme": "Theme title",
              "description": "Theme summary",
              "days": [
                {{
                  "day": 1,
                  "title": "Topic Title",
                  "topic": "Specific Topic",
                  "category": "Category",
                  "priority": "High" | "Medium" | "Low",
                  "estimatedHours": 2.5,
                  "tasks": ["Task 1", "Task 2"],
                  "resources": [{{"type": "documentation", "title": "Doc Name", "url": "https://..."}}]
                }}
              ]
            }}
          ]
        }}
        """
        
        try:
            result = self.llm.generate_json(prompt, system_prompt)
            
            if "error" in result:
                logger.error(f"LLM Generation failed: {result['error']}")
                return self._get_fallback_roadmap(target_role, weak_topics, user_id)
                
            # Construct the final roadmap dictionary
            roadmap_data = {
                "id": f"road_{uuid.uuid4().hex[:12]}",
                "user_id": user_id,
                "targetRole": target_role,
                "weakTopics": weak_topics,
                "weeks": result.get("weeks", []),
                "createdAt": datetime.utcnow().isoformat()
            }
            return roadmap_data
            
        except Exception as e:
            logger.error(f"Roadmap generation exception: {e}")
            return self._get_fallback_roadmap(target_role, weak_topics, user_id)

    def _get_fallback_roadmap(self, target_role: str, weak_topics: List[str], user_id: str) -> dict:
        """Provides a safe fallback if the LLM provider times out."""
        return {
            "id": f"road_{uuid.uuid4().hex[:12]}",
            "user_id": user_id,
            "targetRole": target_role,
            "weakTopics": weak_topics,
            "createdAt": datetime.utcnow().isoformat(),
            "weeks": [
                {
                    "weekNumber": 1,
                    "theme": "Core Fundamentals Recovery",
                    "description": "Addressing immediate gaps identified during the mock interview.",
                    "days": [
                        {
                            "day": 1,
                            "title": f"Review {weak_topics[0] if weak_topics else 'Core Mechanics'}",
                            "topic": weak_topics[0] if weak_topics else "Fundamentals",
                            "category": "Technical",
                            "priority": "High",
                            "estimatedHours": 2.0,
                            "tasks": ["Review official documentation", "Complete 2 practice exercises"],
                            "resources": [],
                            "completed": False
                        }
                    ]
                }
            ]
        }