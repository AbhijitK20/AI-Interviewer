from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional
from app.services.llm_service import LLMService
from app.services.resume_parser import ResumeParser
from app.services.evaluation_service import EvaluationService
from app.services.voice_service import VoiceService
from app.services.emotion_service import EmotionService

router = APIRouter()

llm_service = LLMService()
resume_parser = ResumeParser()
evaluation_service = EvaluationService()
voice_service = VoiceService()
emotion_service = EmotionService()


class QuestionGenerationRequest(BaseModel):
    job_description: str
    resume_text: Optional[str] = ""
    count: int = 10
    experience_level: str = "MID"


class FollowUpRequest(BaseModel):
    question: str
    answer: str


class EvaluationRequest(BaseModel):
    question: str
    answer: str
    expected_answer: Optional[str] = ""


class ResumeParseRequest(BaseModel):
    resume_text: str


class JDAnalysisRequest(BaseModel):
    job_description: str


class ReportGenerationRequest(BaseModel):
    interview_id: int
    evaluations: List[dict] = []
    average_score: int = 0
    total_questions: int = 0
    answered_questions: int = 0
    job_description: str = ""


class SynthesizeRequest(BaseModel):
    text: str
    voice: str = "en-US-AriaNeural"
    rate: float = 1.0


class EmotionAnalysisRequest(BaseModel):
    audio_features: dict
    transcript: Optional[str] = ""


@router.post("/generate-questions")
async def generate_questions(request: QuestionGenerationRequest):
    try:
        questions = await llm_service.generate_questions(
            job_description=request.job_description,
            resume_text=request.resume_text,
            count=request.count,
            experience_level=request.experience_level
        )
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-followup")
async def generate_followup(request: FollowUpRequest):
    try:
        follow_up = await llm_service.generate_followup(
            question=request.question,
            answer=request.answer
        )
        return {"follow_up": follow_up}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate-answer")
async def evaluate_answer(request: EvaluationRequest):
    try:
        evaluation = await evaluation_service.evaluate(
            question=request.question,
            answer=request.answer,
            expected_answer=request.expected_answer
        )
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/parse-resume")
async def parse_resume(request: ResumeParseRequest):
    try:
        parsed_data = resume_parser.parse(request.resume_text)
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-jd")
async def analyze_jd(request: JDAnalysisRequest):
    try:
        analysis = await llm_service.analyze_job_description(request.job_description)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-report")
async def generate_report(request: ReportGenerationRequest):
    try:
        report = await llm_service.generate_report(
            interview_id=request.interview_id,
            evaluations=request.evaluations,
            average_score=request.average_score,
            total_questions=request.total_questions,
            answered_questions=request.answered_questions,
            job_description=request.job_description
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    try:
        audio_data = await audio.read()
        transcript = await voice_service.transcribe(audio_data)
        return {"transcript": transcript, "confidence": 0.95, "language": "en-US"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/synthesize")
async def synthesize_speech(request: SynthesizeRequest):
    try:
        audio_data = await voice_service.synthesize(request.text, request.voice, request.rate)
        return Response(content=audio_data, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-emotion")
async def analyze_emotion(request: EmotionAnalysisRequest):
    try:
        emotion_data = emotion_service.analyze(request.audio_features, request.transcript)
        return emotion_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def get_voices():
    return voice_service.get_available_voices()
