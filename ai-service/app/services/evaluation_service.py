from typing import Dict, Optional


class EvaluationService:
    def __init__(self):
        self.grading_scale = {
            (90, 100): "A+",
            (80, 89): "A",
            (70, 79): "B",
            (60, 69): "C",
            (50, 59): "D",
            (0, 49): "F"
        }

    async def evaluate(
        self,
        question: str,
        answer: str,
        expected_answer: Optional[str] = ""
    ) -> Dict:
        score = self._calculate_score(question, answer, expected_answer)
        grade = self._get_grade(score)
        feedback = self._generate_feedback(question, answer, score)

        return {
            "score": score,
            "grade": grade,
            "feedback": feedback,
            "confidence_level": self._assess_confidence(answer),
            "communication_score": self._assess_communication(answer),
            "technical_depth": self._assess_technical_depth(answer),
            "strengths": self._identify_strengths(answer),
            "weaknesses": self._identify_weaknesses(answer),
            "improvement_suggestions": self._generate_suggestions(answer, score)
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

    def _get_grade(self, score: int) -> str:
        for (low, high), grade in self.grading_scale.items():
            if low <= score <= high:
                return grade
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

    def _identify_strengths(self, answer: str) -> list:
        strengths = []
        if len(answer) > 200:
            strengths.append("Detailed response")
        if "example" in answer.lower():
            strengths.append("Provides examples")
        if any(word in answer.lower() for word in ["first", "second", "finally"]):
            strengths.append("Structured answer")
        return strengths if strengths else ["Attempted to answer"]

    def _identify_weaknesses(self, answer: str) -> list:
        weaknesses = []
        if len(answer) < 100:
            weaknesses.append("Brief response - needs more detail")
        if "example" not in answer.lower():
            weaknesses.append("Could benefit from examples")
        return weaknesses if weaknesses else []

    def _generate_suggestions(self, answer: str, score: int) -> str:
        if score >= 80:
            return "Keep up the excellent work. Consider discussing edge cases and trade-offs."
        elif score >= 60:
            return "Add more specific examples and explain your reasoning step by step."
        elif score >= 40:
            return "Structure your answers using the STAR method. Provide concrete examples."
        else:
            return "Practice answering technical questions aloud. Focus on clarity and depth."
