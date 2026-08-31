# AI Interviewer System

A comprehensive AI-powered technical interview platform that conducts realistic interviews, adapts questions based on candidate responses, evaluates answers, and generates detailed performance reports.

## Live Demo

🔗 [**https://ai-interviewer-rho-hazel.vercel.app**](https://ai-interviewer-rho-hazel.vercel.app)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React +       │────▶│  Spring Boot    │────▶│  Python FastAPI │
│   Tailwind      │     │  Backend        │     │  AI Service     │
│   Frontend      │     │  (Port 8080)    │     │  (Port 8001)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  TiDB Cloud /   │
                        │  MySQL Database │
                        └─────────────────┘
```

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- Recharts (for reports)
- Axios
- Three.js (3D avatar)
- MediaPipe (body language analysis)
- face-api.js (proctoring)

### Backend
- Java 21 + Spring Boot 3.4
- Spring Security + JWT
- Spring Data JPA
- MySQL Connector

### AI Service
- Python 3.11+
- FastAPI
- LangChain
- Gemini 2.5 Flash (free tier)
- Edge-TTS (neural voice)
- Deepgram (speech-to-text)

### Database
- TiDB Cloud (free tier) / MySQL 8.0+

## Project Structure

```
ai-interviewer/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/interviewer/
│   │   ├── config/         # Security, CORS config
│   │   ├── controller/     # REST controllers
│   │   ├── dto/            # Data transfer objects
│   │   ├── entity/         # JPA entities
│   │   ├── repository/     # Data repositories
│   │   ├── security/       # JWT utilities
│   │   └── service/        # Business logic
│   ├── Dockerfile
│   └── pom.xml
├── ai-service/             # Python FastAPI AI service
│   ├── app/
│   │   ├── routers/        # API routes
│   │   └── services/       # AI services
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── data/           # Static data (job roles)
│   │   └── context/        # React context
│   ├── DESIGN.md           # Design system
│   └── package.json
├── database/               # Database schema
│   └── schema.sql
├── render.yaml             # Render deployment config
└── docs/                   # Documentation
```

## Features

### Core Features
- User authentication with JWT
- Resume upload and parsing (paste text or upload file)
- Job description management with 20 predefined job roles
- AI-powered question generation (Gemini 2.5 Flash)
- Adaptive interview flow with follow-up questions
- Answer evaluation with scoring and feedback
- Performance reports with radar charts and PDF export
- Text, voice, and coding interview modes

### Camera & Analysis Features
- **Proctoring Monitor** — face detection, gaze tracking, blink detection, integrity score
- **Body Language Analyzer** — posture, engagement, eye contact, fidgeting detection
- **Speech Emotion Analyzer** — pitch, energy, speaking rate analysis
- **Digital Avatar** — 3D animated interviewer with lip sync

### Voice Features
- Text-to-Speech (Edge-TTS neural voices, free)
- Speech-to-Text (Deepgram)
- Auto-speaking avatar
- Play/pause/mute controls

## Deployment

### Render (Backend + AI Service)
1. Connect GitHub repo to Render
2. Use `render.yaml` Blueprint
3. Add environment variables in Render dashboard

### Vercel (Frontend)
1. Import GitHub repo to Vercel
2. Set Root Directory to `frontend`
3. Add `VITE_API_URL` environment variable

### TiDB Cloud (Database)
1. Create free Starter instance
2. Get connection details
3. Update backend environment variables

## Default Credentials

Register a new account at the app. No default credentials are provided for security.

## API Documentation

See [docs/API.md](docs/API.md) for complete API reference.

## Development

### Running Locally

```bash
# Database setup
mysql -u root -p < database/schema.sql

# Backend
cd backend
mvn spring-boot:run

# AI Service
cd ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Frontend
cd frontend
npm install
npm run dev
```

### Building for Production

```bash
# Backend
cd backend
mvn clean package

# Frontend
cd frontend
npm run build
```

## License

MIT License
