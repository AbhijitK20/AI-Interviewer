#!/usr/bin/env python3
"""Generate 200 interview questions per job role using Gemini and save to JSON."""

import json
import os
import time
from google import genai

API_KEY = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
MODEL = "gemini-3.5-flash-lite"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "src", "main", "resources", "question-banks")

ROLES = [
    {"title": "Frontend Developer", "topics": ["React hooks", "CSS layout", "performance optimization", "state management", "browser rendering", "accessibility", "component design patterns", "virtual DOM", "webpack/vite", "testing"]},
    {"title": "Backend Developer", "topics": ["API design", "database optimization", "caching", "microservices", "security", "scalability", "error handling", "auth", "message queues", "connection pooling"]},
    {"title": "Full Stack Developer", "topics": ["system design", "API integration", "database design", "frontend-backend communication", "deployment", "testing", "DevOps basics", "authentication", "caching", "performance"]},
    {"title": "Java Developer", "topics": ["OOP", "Spring Boot", "JPA/Hibernate", "multithreading", "JVM internals", "design patterns", "Java collections", "stream API", "concurrency", "testing"]},
    {"title": "Python Developer", "topics": ["Python internals", "async/await", "decorators", "generators", "testing", "Django/Flask/FastAPI", "data structures", "packaging", "type hints", "performance"]},
    {"title": "AI/ML Engineer", "topics": ["neural networks", "model training", "feature engineering", "overfitting", "transfer learning", "MLOps", "evaluation metrics", "NLP", "computer vision", "deployment"]},
    {"title": "DevOps Engineer", "topics": ["containerization", "orchestration", "CI/CD", "IaC", "monitoring", "incident response", "cloud architecture", "Linux", "scripting", "security"]},
    {"title": "Data Engineer", "topics": ["data modeling", "ETL", "data quality", "streaming", "SQL optimization", "data warehousing", "schema design", "Spark", "Airflow", "Kafka"]},
    {"title": "Data Scientist", "topics": ["statistics", "hypothesis testing", "A/B testing", "feature selection", "model interpretation", "visualization", "business metrics", "regression", "classification", "clustering"]},
    {"title": "Data Analyst", "topics": ["SQL queries", "data cleaning", "visualization", "KPI definition", "trend analysis", "reporting", "business acumen", "Excel", "Tableau", "Python for analysis"]},
    {"title": "Cloud Architect", "topics": ["cloud services", "architecture patterns", "cost optimization", "security", "migration", "multi-cloud", "disaster recovery", "networking", "serverless", "IAM"]},
    {"title": "Mobile Developer", "topics": ["mobile architecture", "state management", "offline support", "push notifications", "app store", "performance", "responsive design", "navigation", "testing", "CI/CD"]},
    {"title": "QA Engineer", "topics": ["test strategies", "automation frameworks", "API testing", "performance testing", "test data", "CI/CD", "bug reporting", "exploratory testing", "accessibility testing", "security testing"]},
    {"title": "System Design Architect", "topics": ["scalability", "consistency", "caching", "database selection", "message queues", "load balancing", "CAP theorem", "rate limiting", "sharding", "replication"]},
    {"title": "Cybersecurity Engineer", "topics": ["threat modeling", "vulnerability assessment", "incident response", "security architecture", "compliance", "encryption", "access control", "penetration testing", "SIEM", "forensics"]},
    {"title": "Product Manager", "topics": ["product strategy", "prioritization", "user research", "metrics", "stakeholder management", "agile", "market analysis", "roadmapping", "competitive analysis", "go-to-market"]},
    {"title": "UI/UX Designer", "topics": ["design process", "user research", "accessibility", "design systems", "prototyping", "usability testing", "visual design", "information architecture", "interaction design", "motion design"]},
    {"title": "Site Reliability Engineer", "topics": ["SLIs/SLOs", "incident management", "capacity planning", "automation", "monitoring", "postmortems", "chaos engineering", "toil reduction", "release engineering", "dependency management"]},
    {"title": "Blockchain Developer", "topics": ["smart contract security", "consensus mechanisms", "gas optimization", "DeFi", "token standards", "testing", "upgradeability", "cross-chain", "Layer 2", "DAOs"]},
    {"title": "Game Developer", "topics": ["game loops", "physics simulation", "AI in games", "rendering", "networking", "optimization", "game design patterns", "audio", "animation", "UI/UX"]},
]

def generate_questions_for_role(role):
    client = genai.Client(api_key=API_KEY)
    
    prompt = f"""Generate exactly 200 unique interview questions for the role: {role['title']}

Cover these topics thoroughly: {', '.join(role['topics'])}

Mix of question types:
- 60% TECHNICAL (conceptual + practical)
- 20% BEHAVIORAL (STAR method questions)
- 10% SITUATIONAL (hypothetical scenarios)
- 10% CODING/PROBLEM SOLVING

Mix of difficulties:
- 30% EASY
- 40% MEDIUM
- 20% HARD
- 10% EXPERT

Return ONLY a JSON array. Each item:
{{
  "text": "question text",
  "type": "TECHNICAL|BEHAVIORAL|SITUATIONAL|CODING|SYSTEM_DESIGN",
  "difficulty": "EASY|MEDIUM|HARD|EXPERT",
  "expected_answer": "2-3 sentence ideal answer covering key points"
}}

No markdown, no code blocks. Just raw JSON array of 200 items."""

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
    )
    
    text = response.text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(l for l in lines if not l.strip().startswith("```")).strip()
    
    questions = json.loads(text)
    return questions[:200]

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    for i, role in enumerate(ROLES):
        filename = role["title"].lower().replace("/", "-").replace(" ", "-") + ".json"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        if os.path.exists(filepath):
            with open(filepath) as f:
                existing = json.load(f)
            if len(existing) >= 150:
                print(f"[{i+1}/{len(ROLES)}] {role['title']}: Already has {len(existing)} questions, skipping")
                continue
        
        print(f"[{i+1}/{len(ROLES)}] Generating {role['title']}...")
        try:
            questions = generate_questions_for_role(role)
            with open(filepath, "w") as f:
                json.dump(questions, f, indent=2)
            print(f"  Saved {len(questions)} questions to {filename}")
            time.sleep(8)  # Rate limit buffer
        except Exception as e:
            print(f"  ERROR: {e}")

if __name__ == "__main__":
    main()
