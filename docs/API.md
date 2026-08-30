# API Documentation

Base URL: `http://localhost:8080/api`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "profileSummary": "Software engineer with 5 years experience",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "githubUrl": "https://github.com/johndoe"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGc...",
  "tokenType": "Bearer",
  "userId": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "CANDIDATE"
}
```

### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):** Same as register response.

---

## Interview Endpoints

### Start Interview
```
POST /api/interviews/start
```

**Request Body:**
```json
{
  "jobDescriptionId": 1,
  "resumeId": 1,
  "title": "Senior Java Developer Interview",
  "mode": "TEXT",
  "totalQuestions": 10,
  "durationMinutes": 60,
  "notes": "Focus on Spring Boot and microservices"
}
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Senior Java Developer Interview",
  "status": "SCHEDULED",
  "mode": "TEXT",
  "totalQuestions": 10,
  "currentQuestionIndex": 0,
  "durationMinutes": 60,
  "createdAt": "2024-01-15T10:00:00",
  "jobDescriptionTitle": "Senior Java Developer",
  "companyName": "Tech Corp",
  "sessions": []
}
```

### Begin Interview Session
```
POST /api/interviews/{interviewId}/begin
```

**Response (200):** Interview object with status `IN_PROGRESS`.

### Get Next Question
```
GET /api/interviews/{interviewId}/next-question
```

**Response (200):**
```json
{
  "id": 1,
  "questionOrder": 1,
  "questionText": "Explain the difference between abstract class and interface in Java.",
  "questionType": "TECHNICAL",
  "difficulty": "MEDIUM",
  "candidateAnswer": null,
  "aiFollowUp": null,
  "followUpAnswer": null,
  "status": "PENDING",
  "evaluation": null
}
```

### Submit Answer
```
POST /api/interviews/{interviewId}/answer
```

**Request Body:**
```json
{
  "sessionId": 1,
  "answer": "An abstract class can have constructors...",
  "followUpAnswer": null
}
```

**Response (200):** Session object with evaluation.

### End Interview
```
POST /api/interviews/{interviewId}/end
```

**Response (200):** Interview object with status `COMPLETED`.

### Get User Interviews
```
GET /api/interviews
```

**Response (200):** Array of interview objects.

### Get Interview Details
```
GET /api/interviews/{interviewId}
```

**Response (200):** Interview object with sessions.

---

## Report Endpoints

### Get Report
```
GET /api/reports/{interviewId}
```

**Response (200):**
```json
{
  "id": 1,
  "interviewId": 1,
  "overallScore": 78,
  "overallGrade": "B",
  "summary": "Strong technical knowledge...",
  "skillRadarData": "[{\"skill\":\"Java\",\"score\":85}]",
  "categoryScores": "[{\"category\":\"Technical\",\"score\":80}]",
  "strengths": "[\"Clear communication\"]",
  "weaknesses": "[\"Needs more examples\"]",
  "recommendations": "Practice system design...",
  "recommendationLevel": "RECOMMENDED",
  "createdAt": "2024-01-15T11:00:00"
}
```

---

## Resume Endpoints

### Upload Resume
```
POST /api/resumes/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Resume file (PDF, DOC, DOCX)

**Response (200):**
```json
{
  "id": 1,
  "fileName": "resume.pdf",
  "status": "PARSING",
  "createdAt": "2024-01-15T10:00:00"
}
```

### Get User Resumes
```
GET /api/resumes
```

**Response (200):** Array of resume objects.

---

## Job Description Endpoints

### Create Job Description
```
POST /api/jds
```

**Request Body:**
```json
{
  "title": "Senior Java Developer",
  "company": "Tech Corp",
  "description": "We are looking for...",
  "experienceLevel": "SENIOR",
  "location": "Remote",
  "employmentType": "FULL_TIME"
}
```

**Response (200):** Job description object.

### Get Job Descriptions
```
GET /api/jds
```

**Response (200):** Array of job description objects.

### Match Resume to JD
```
POST /api/match
```

**Request Body:**
```json
{
  "resumeId": 1,
  "jobDescriptionId": 1
}
```

**Response (200):**
```json
{
  "id": 1,
  "matchScore": 85.5,
  "matchedSkills": ["Java", "Spring Boot"],
  "missingSkills": ["Kubernetes"],
  "analysisDetails": "..."
}
```

---

## AI Service Endpoints (Internal)

Base URL: `http://localhost:8000/ai`

### Generate Questions
```
POST /ai/generate-questions
```

### Generate Follow-up
```
POST /ai/generate-followup
```

### Evaluate Answer
```
POST /ai/evaluate-answer
```

### Parse Resume
```
POST /ai/parse-resume
```

### Analyze Job Description
```
POST /ai/analyze-jd
```

### Generate Report
```
POST /ai/generate-report
```

---

## Error Responses

All errors return:
```json
{
  "timestamp": "2024-01-15T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Error description",
  "path": "/api/endpoint"
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |
