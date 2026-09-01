import os
from typing import Dict, Optional


class EvaluationService:
    def __init__(self):
        self.llm_provider = os.getenv("LLM_PROVIDER", "mock")
        self.api_key = os.getenv("LLM_API_KEY", os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", "")))

    async def evaluate(
        self,
        question: str,
        answer: str,
        expected_answer: Optional[str] = ""
    ) -> Dict:
        # Try Gemini LLM evaluation first
        if self.api_key:
            result = await self._evaluate_with_llm(question, answer, expected_answer)
            if result:
                return result

        # Fallback to heuristic evaluation
        return self._evaluate_heuristic(question, answer, expected_answer)

    async def _evaluate_with_llm(self, question: str, answer: str, expected_answer: str) -> Optional[Dict]:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            from langchain_core.messages import HumanMessage

            prompt = f"""You are an expert interview evaluator. Evaluate the candidate's answer to this interview question.

Question: {question}

Candidate's Answer: {answer}

{f"Expected/ideal answer for reference: {expected_answer}" if expected_answer else ""}

Provide a thorough evaluation in this EXACT JSON format (no markdown, no code blocks):

{{
  "score": <0-100 integer>,
  "feedback": "<2-3 sentences: specific assessment of what the answer does well and what it lacks. Be direct and constructive.>",
  "strengths": "<1-2 sentences: specific strengths of this answer>",
  "weaknesses": "<1-2 sentences: specific areas for improvement>",
  "sample_response": "<A complete, well-structured sample answer to this same question that would score 85-95. Use the STAR method for behavioral questions. Make it realistic and specific.>",
  "improvement_points": ["<specific point 1>", "<specific point 2>", "<specific point 3>"]
}}

Evaluation criteria:
- Score 80+: Strong answer with specific examples, clear structure, demonstrates expertise
- Score 60-79: Good answer but missing specifics, examples, or depth
- Score 40-59: Adequate but vague, lacks concrete examples or structure
- Score below 40: Incomplete, off-topic, or shows lack of preparation

Be specific about WHAT is missing, not just that it's missing."""

            llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash-lite", google_api_key=self.api_key, temperature=0.3)
            response = await llm.ainvoke([HumanMessage(content=prompt)])
            
            import json
            text = response.content.strip()
            if text.startswith("```"):
                lines = text.split("\n")
                text = "\n".join(l for l in lines if not l.strip().startswith("```")).strip()
            
            data = json.loads(text)
            
            return {
                "score": min(100, max(0, int(data.get("score", 60)))),
                "grade": self._score_to_grade(int(data.get("score", 60))),
                "feedback": data.get("feedback", "Answer evaluated."),
                "strengths": data.get("strengths", ""),
                "weaknesses": data.get("weaknesses", ""),
                "sample_response": data.get("sample_response", ""),
                "improvement_suggestions": ", ".join(data.get("improvement_points", [])) if isinstance(data.get("improvement_points"), list) else str(data.get("improvement_suggestions", "")),
                "confidence_level": self._assess_confidence(answer),
                "communication_score": self._assess_communication(answer),
                "technical_depth": self._assess_technical_depth(answer),
            }
        except Exception as e:
            print(f"LLM evaluation error: {e}")
            return None

    def _evaluate_heuristic(self, question: str, answer: str, expected_answer: str) -> Dict:
        score = self._calculate_score(question, answer, expected_answer)
        feedback = self._generate_feedback(question, answer, score)

        return {
            "score": score,
            "grade": self._score_to_grade(score),
            "feedback": feedback,
            "strengths": self._identify_strengths(answer),
            "weaknesses": self._identify_weaknesses(answer),
            "sample_response": "",
            "improvement_suggestions": self._generate_suggestions(answer, score),
            "confidence_level": self._assess_confidence(answer),
            "communication_score": self._assess_communication(answer),
            "technical_depth": self._assess_technical_depth(answer),
        }

    def _calculate_score(self, question: str, answer: str, expected_answer: str) -> int:
        if not answer or len(answer.strip()) < 10:
            return 20
        base_score = 50
        if len(answer) > 100:
            base_score += 10
        if len(answer) > 300:
            base_score += 10
        technical_keywords = [
            "algorithm", "data structure", "complexity", "design", "architecture",
            "pattern", "framework", "database", "api", "scalab", "performance",
            "optimiz", "implement", "interface", "class", "method", "function"
        ]
        keyword_count = sum(1 for kw in technical_keywords if kw in answer.lower())
        base_score += min(keyword_count * 3, 20)
        if expected_answer:
            expected_words = set(expected_answer.lower().split())
            answer_words = set(answer.lower().split())
            overlap = len(expected_words & answer_words)
            if overlap > 3:
                base_score += 10
        return min(base_score, 100)

    def _score_to_grade(self, score: int) -> str:
        if score >= 90: return "A+"
        if score >= 80: return "A"
        if score >= 70: return "B+"
        if score >= 60: return "B"
        if score >= 50: return "C+"
        if score >= 40: return "C"
        if score >= 30: return "D"
        return "F"

    def _generate_feedback(self, question: str, answer: str, score: int) -> str:
        if score >= 80:
            return "Excellent answer! You demonstrated strong technical knowledge and clear communication."
        elif score >= 60:
            return "Good answer with solid understanding. Consider adding more specific examples."
        elif score >= 40:
            return "Fair answer but lacks depth. Try to elaborate on key concepts and provide examples."
        else:
            return "Answer needs significant improvement. Focus on addressing the core question with technical details."

    def _assess_confidence(self, answer: str) -> str:
        uncertain_phrases = ["i think", "maybe", "probably", "not sure", "i guess"]
        uncertain_count = sum(1 for phrase in uncertain_phrases if phrase in answer.lower())
        if uncertain_count == 0:
            return "HIGH"
        elif uncertain_count <= 2:
            return "MEDIUM"
        else:
            return "LOW"

    def _assess_communication(self, answer: str) -> str:
        if len(answer) < 50:
            return "NEEDS_IMPROVEMENT"
        elif len(answer) < 200:
            return "ADEQUATE"
        else:
            return "GOOD"

    def _assess_technical_depth(self, answer: str) -> str:
        depth_indicators = [
            "because", "therefore", "this means", "as a result",
            "for example", "specifically", "in practice"
        ]
        indicator_count = sum(1 for ind in depth_indicators if ind in answer.lower())
        if indicator_count >= 3:
            return "DEEP"
        elif indicator_count >= 1:
            return "MODERATE"
        else:
            return "SURFACE"

    def _identify_strengths(self, answer: str) -> str:
        strengths = []
        if len(answer) > 200:
            strengths.append("Detailed response")
        if "example" in answer.lower():
            strengths.append("Provides examples")
        if any(word in answer.lower() for word in ["first", "second", "finally"]):
            strengths.append("Structured answer")
        return ", ".join(strengths) if strengths else "Attempted to answer"

    def _identify_weaknesses(self, answer: str) -> str:
        weaknesses = []
        if len(answer) < 100:
            weaknesses.append("Brief response - needs more detail")
        if "example" not in answer.lower():
            weaknesses.append("Could benefit from examples")
        return ", ".join(weaknesses) if weaknesses else "None identified"

    def _generate_suggestions(self, answer: str, score: int) -> str:
        if score >= 80:
            return "Keep up the excellent work. Consider discussing edge cases and trade-offs."
        elif score >= 60:
            return "Add more specific examples and explain your reasoning step by step."
        elif score >= 40:
            return "Structure your answers using the STAR method. Provide concrete examples."
        else:
            return "Practice answering technical questions aloud. Focus on clarity and depth."
