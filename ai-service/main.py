from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ai_router
from app.services.llm_service import LLMService
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="AI Interviewer Service",
    description="AI microservice for interview question generation, evaluation, and analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router.router, prefix="/ai", tags=["AI"])

llm_service = LLMService()

@app.get("/")
async def root():
    return {"message": "AI Interviewer Service is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-interviewer"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
