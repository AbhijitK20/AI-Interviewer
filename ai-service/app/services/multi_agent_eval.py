#!/usr/bin/env python3
"""Multi-agent interview evaluation using crewAI"""

import os
import json
from typing import Dict, List

# Note: This requires crewAI to be installed
# pip install crewai crewai-tools

def evaluate_with_crew(question: str, answer: str, expected_answer: str = "") -> Dict:
    """Evaluate interview answer using multiple AI agents"""
    
    # For now, return a structured evaluation
    # When crewAI is properly configured, this will use:
    # - Technical Expert Agent: evaluates technical accuracy
    # - Communication Agent: evaluates clarity and structure
    # - Behavioral Agent: evaluates soft skills and experience
    
    evaluation = {
        "score": 0,
        "grade": "F",
        "feedback": "",
        "strengths": [],
        "weaknesses": [],
        "sample_response": "",
        "technical_score": 0,
        "communication_score": 0,
        "behavioral_score": 0
    }
    
    # Simple scoring for now
    if not answer or len(answer.strip()) < 10:
        evaluation["score"] = 20
        evaluation["grade"] = "F"
        evaluation["feedback"] = "Answer is too brief or empty. Please provide a more detailed response."
        evaluation["weaknesses"] = ["Insufficient detail", "No examples provided"]
        return evaluation
    
    # Base score
    score = 50
    
    # Length bonus
    if len(answer) > 100:
        score += 10
    if len(answer) > 300:
        score += 10
    
    # Technical keywords
    technical_terms = ["algorithm", "design", "pattern", "architecture", "database", "api", "test", "deploy"]
    tech_count = sum(1 for term in technical_terms if term in answer.lower())
    score += min(tech_count * 3, 15)
    
    # Structure bonus
    if any(marker in answer for marker in ["first", "second", "1.", "2.", "step"]):
        score += 5
    
    # Examples bonus
    if any(marker in answer for marker in ["example", "for instance", "such as", "like"]):
        score += 5
    
    # Clamp score
    score = min(score, 100)
    
    # Determine grade
    if score >= 90:
        grade = "A+"
    elif score >= 80:
        grade = "A"
    elif score >= 70:
        grade = "B+"
    elif score >= 60:
        grade = "B"
    elif score >= 50:
        grade = "C+"
    elif score >= 40:
        grade = "C"
    else:
        grade = "D"
    
    # Generate feedback
    if score >= 80:
        feedback = "Excellent answer with strong technical depth and clear communication."
        strengths = ["Strong technical knowledge", "Clear structure", "Good examples"]
        weaknesses = ["Could add more edge cases"]
    elif score >= 60:
        feedback = "Good answer with solid understanding. Consider adding more specific examples."
        strengths = ["Good technical foundation", "Clear explanation"]
        weaknesses = ["Needs more concrete examples", "Could be more detailed"]
    elif score >= 40:
        feedback = "Adequate answer but lacks depth. Provide more specific examples and technical details."
        strengths = ["Basic understanding demonstrated"]
        weaknesses = ["Needs more detail", "Lacks specific examples", "Could be more structured"]
    else:
        feedback = "Answer needs significant improvement. Focus on providing concrete examples and technical depth."
        strengths = []
        weaknesses = ["Too brief", "No examples", "Missing technical details"]
    
    evaluation.update({
        "score": score,
        "grade": grade,
        "feedback": feedback,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "technical_score": min(100, score + 5),
        "communication_score": min(100, score - 5 if score > 20 else 20),
        "behavioral_score": min(100, score)
    })
    
    return evaluation

if __name__ == "__main__":
    # Test evaluation
    result = evaluate_with_crew(
        "Explain the difference between REST and GraphQL APIs.",
        "REST uses multiple endpoints for different resources, while GraphQL uses a single endpoint. REST is simpler but can lead to over-fetching. GraphQL is more flexible but has a steeper learning curve."
    )
    print(json.dumps(result, indent=2))
