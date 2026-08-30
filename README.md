# AI Interviewer System

A comprehensive AI-powered technical interview platform that conducts realistic interviews, adapts questions based on candidate responses, evaluates answers, and generates detailed performance reports.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React +       │────▶│  Spring Boot    │────▶│  Python FastAPI │
│   Tailwind      │     │  Backend        │     │  AI Service     │
│   Frontend      │     │  (Port 8080)    │     │  (Port 8000)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  MySQL/MariaDB  │
                        │  Database       │
                        └─────────────────┘
```

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- Recharts (for reports)
- Axios

### Backend
- Java 21 + Spring Boot 3.4
- Spring Security + JWT
- Spring Data JPA
- MySQL Connector

### AI Service
- Python 3.11+
- FastAPI
- LangChain
- OpenAI / Gemini (configurable)

### Database
- MySQL 8.0+ / MariaDB 10.6+

## Project Structure

```
ai-interviwer/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/interviewer/
│   │   ├── config/         # Security, CORS config
│   │   ├── controller/     # REST controllers
│   │   ├── dto/            # Data transfer objects
│   │   ├── entity/         # JPA entities
│   │   ├── repository/     # Data repositories
│   │   ├── security/       # JWT utilities
│   │   └── service/        # Business logic
│   └── pom.xml
├── ai-service/             # Python FastAPI AI service
│   ├── app/
│   │   ├── routers/        # API routes
│   │   └── services/       # AI services
│   ├── main.py
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── context/        # React context
│   └── package.json
├── database/               # Database schema
│   └── schema.sql
└── docs/                   # Documentation
```

## Getting Started

### Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 18+
- Python 3.11+
- MySQL 8.0+ or MariaDB 10.6+

### 1. Database Setup

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Update database credentials in src/main/resources/application.properties
# spring.datasource.username=your_username
# spring.datasource.password=your_password

# Build and run
mvn spring-boot:run
```

Backend will start on http://localhost:8080

### 3. AI Service Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run service
uvicorn main:app --reload --port 8000
```

AI Service will start on http://localhost:8000

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will start on http://localhost:5173

## Default Credentials

Admin user (created by schema.sql):
- Email: admin@interviewer.com
- Password: admin123

## API Documentation

See [docs/API.md](docs/API.md) for complete API reference.

## Features

### Core Features
- User authentication with JWT
- Resume upload and parsing
- Job description analysis
- Resume-JD matching
- AI-powered question generation
- Adaptive interview flow
- Answer evaluation
- Performance reports with radar charts

### Planned Features
- Real-time voice interview (STT/TTS)
- Live coding environment
- Multi-panelist simulation
- Body language analysis
- Company-specific interview modes
- STAR method analysis
- PDF report export
- Performance trends

## Development

### Running Tests

```bash
# Backend tests
cd backend
mvn test

# AI Service tests
cd ai-service
pytest

# Frontend tests
cd frontend
npm test
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
