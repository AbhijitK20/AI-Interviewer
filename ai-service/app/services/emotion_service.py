from typing import Dict, Optional, List


class EmotionService:
    def __init__(self):
        self.emotion_keywords = {
            "happy": ["great", "good", "excellent", "love", "enjoy", "happy", "excited", "wonderful"],
            "sad": ["sad", "unfortunately", "disappointing", "difficult", "struggle", "failed"],
            "angry": ["angry", "frustrated", "annoying", "terrible", "hate", "unacceptable"],
            "fearful": ["worried", "nervous", "scared", "afraid", "anxious", "concerned"],
            "surprised": ["wow", "amazing", "unexpected", "surprising", "incredible"],
            "confident": ["definitely", "certainly", "absolutely", "clearly", "obviously", "I know"],
        }

    def analyze(self, audio_features: Dict, transcript: Optional[str] = "") -> Dict:
        # Analyze audio features
        pitch = audio_features.get("pitch", 50)
        energy = audio_features.get("energy", 50)
        speaking_rate = audio_features.get("speaking_rate", 50)

        # Analyze transcript for emotional keywords
        text_emotion = self._analyze_text_emotion(transcript) if transcript else None

        # Combine audio and text analysis
        audio_emotion = self._analyze_audio_emotion(pitch, energy, speaking_rate)

        # Determine final emotion
        if text_emotion and text_emotion["confidence"] >= 60:
            final_emotion = text_emotion["emotion"]
            confidence = text_emotion["confidence"]
        else:
            final_emotion = audio_emotion["emotion"]
            confidence = audio_emotion["confidence"]

        return {
            "emotion": final_emotion,
            "confidence": confidence,
            "audio_features": {
                "pitch": pitch,
                "energy": energy,
                "speaking_rate": speaking_rate,
            },
            "text_emotion": text_emotion,
            "audio_emotion": audio_emotion,
            "engagement_score": self._calculate_engagement(energy, speaking_rate),
            "confidence_score": self._calculate_confidence(pitch, energy, transcript),
        }

    def _analyze_text_emotion(self, text: str) -> Optional[Dict]:
        if not text:
            return None

        text_lower = text.lower()
        emotion_scores = {}

        for emotion, keywords in self.emotion_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                emotion_scores[emotion] = score

        if not emotion_scores:
            return {"emotion": "neutral", "confidence": 50}

        max_emotion = max(emotion_scores, key=emotion_scores.get)
        max_score = emotion_scores[max_emotion]
        confidence = min(90, 50 + max_score * 10)

        return {"emotion": max_emotion, "confidence": confidence}

    def _analyze_audio_emotion(self, pitch: int, energy: int, speaking_rate: int) -> Dict:
        # Simple heuristic-based emotion detection from audio features
        if energy > 70 and pitch > 60:
            return {"emotion": "happy", "confidence": 70}
        elif energy > 60 and pitch < 40:
            return {"emotion": "angry", "confidence": 65}
        elif energy < 30 and pitch < 40:
            return {"emotion": "sad", "confidence": 60}
        elif energy > 50 and pitch > 70:
            return {"emotion": "surprised", "confidence": 55}
        elif energy > 40 and energy < 60 and pitch > 45 and pitch < 65:
            return {"emotion": "confident", "confidence": 65}
        else:
            return {"emotion": "neutral", "confidence": 50}

    def _calculate_engagement(self, energy: int, speaking_rate: int) -> int:
        # Engagement based on energy and speaking rate
        engagement = (energy * 0.6 + speaking_rate * 0.4)
        return min(100, max(0, int(engagement)))

    def _calculate_confidence(self, pitch: int, energy: int, transcript: Optional[str]) -> int:
        confidence = 50

        # Stable pitch indicates confidence
        if 40 <= pitch <= 60:
            confidence += 15

        # Good energy level
        if 40 <= energy <= 70:
            confidence += 15

        # Confident language in transcript
        if transcript:
            confident_phrases = [
                "i believe", "i am confident", "definitely", "certainly",
                "in my experience", "i have found", "clearly"
            ]
            text_lower = transcript.lower()
            confident_count = sum(1 for phrase in confident_phrases if phrase in text_lower)
            confidence += min(20, confident_count * 5)

        return min(100, confidence)

    def get_emotion_history_summary(self, history: List[Dict]) -> Dict:
        if not history:
            return {"dominant_emotion": "neutral", "distribution": {}}

        emotion_counts = {}
        for entry in history:
            emotion = entry.get("emotion", "neutral")
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1

        dominant = max(emotion_counts, key=emotion_counts.get)
        total = len(history)

        distribution = {
            emotion: round(count / total * 100, 1)
            for emotion, count in emotion_counts.items()
        }

        return {
            "dominant_emotion": dominant,
            "distribution": distribution,
            "total_samples": total,
        }
