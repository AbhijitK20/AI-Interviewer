import os
import json
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()


class LLMService:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "mock")
        self.api_key = os.getenv("LLM_API_KEY", "")
        self.model = os.getenv("LLM_MODEL", "gpt-4")

    async def generate_questions(
        self,
        job_description: str,
        resume_text: str = "",
        count: int = 10,
        experience_level: str = "MID"
    ) -> List[Dict]:
        if self.provider == "mock":
            return self._generate_mock_questions(count, experience_level, job_description)

        prompt = f"""You are an expert technical interviewer. Generate {count} interview questions
based on the following job description and candidate resume.

Job Description:
{job_description}

Candidate Resume:
{resume_text if resume_text else "Not provided"}

Experience Level: {experience_level}

Generate questions that are:
1. Relevant to the job requirements
2. Appropriate for the experience level
3. A mix of technical, behavioral, and situational questions

        Return ONLY a JSON array with fields: text, type (TECHNICAL/BEHAVIORAL/SITUATIONAL/CODING/SYSTEM_DESIGN),
        difficulty (EASY/MEDIUM/HARD/EXPERT), expected_answer. No markdown, no code blocks, just raw JSON."""
        try:
            response = await self._call_llm(prompt)
            return json.loads(self._clean_json(response))
        except Exception:
            return self._generate_mock_questions(count, experience_level, job_description)

    async def generate_followup(self, question: str, answer: str) -> str:
        if self.provider == "mock":
            return "Can you elaborate on that approach and explain the trade-offs?"

        prompt = f"""Based on this interview question and candidate's answer,
generate a thoughtful follow-up question that digs deeper into their understanding.

Question: {question}
Answer: {answer}

Return only the follow-up question text."""

        try:
            return await self._call_llm(prompt)
        except Exception:
            return "Can you elaborate on that approach and explain the trade-offs?"

    async def analyze_job_description(self, job_description: str) -> Dict:
        if self.provider == "mock":
            return {
                "required_skills": ["Java", "Spring Boot", "MySQL"],
                "experience_level": "MID",
                "key_responsibilities": ["Develop backend services", "Design APIs"],
                "technologies": ["Java", "Spring", "REST"]
            }

        prompt = f"""Analyze this job description and extract:
1. Required skills (technical and soft)
2. Experience level
3. Key responsibilities
4. Technologies mentioned

Job Description:
{job_description}

Return as JSON with fields: required_skills, experience_level, key_responsibilities, technologies"""

        try:
            response = await self._call_llm(prompt)
            return json.loads(self._clean_json(response))
        except Exception:
            return {"required_skills": [], "experience_level": "MID", "key_responsibilities": [], "technologies": []}

    async def generate_report(self, interview_id: int, evaluations: List[Dict] = None, 
                              average_score: int = 0, total_questions: int = 0,
                              answered_questions: int = 0, job_description: str = "") -> Dict:
        if not evaluations:
            evaluations = []
        
        # Calculate category scores
        technical_count = 0
        behavioral_count = 0
        technical_total = 0
        behavioral_total = 0
        
        all_strengths = []
        all_weaknesses = []
        
        for eval_item in evaluations:
            score = eval_item.get("score", 0)
            question = eval_item.get("question", "").lower()
            
            if any(kw in question for kw in ["explain", "what is", "how does", "difference", "design", "optimize"]):
                technical_count += 1
                technical_total += score
            else:
                behavioral_count += 1
                behavioral_total += score
            
            strengths = eval_item.get("strengths", "")
            if strengths:
                all_strengths.extend(self._parse_list_field(strengths))
            weaknesses = eval_item.get("weaknesses", "")
            if weaknesses:
                all_weaknesses.extend(self._parse_list_field(weaknesses))

        # Build skill radar data
        skill_radar = {
            "Technical Knowledge": technical_total // max(technical_count, 1),
            "Communication": min(100, average_score + 10),
            "Problem Solving": min(100, average_score + 5),
            "Domain Expertise": technical_total // max(technical_count, 1),
            "Critical Thinking": behavioral_total // max(behavioral_count, 1),
        }

        category_scores = {
            "Technical": technical_total // max(technical_count, 1),
            "Behavioral": behavioral_total // max(behavioral_count, 1),
            "Overall": average_score,
        }

        # Determine recommendation
        if average_score >= 80:
            recommendation_level = "STRONG_HIRE"
        elif average_score >= 60:
            recommendation_level = "HIRE"
        elif average_score >= 40:
            recommendation_level = "MAYBE"
        else:
            recommendation_level = "NO_HIRE"

        # Build question breakdown
        question_breakdown = []
        for eval_item in evaluations:
            question_breakdown.append({
                "question": eval_item.get("question", ""),
                "answer": eval_item.get("answer", ""),
                "score": eval_item.get("score", 0),
                "grade": eval_item.get("grade", "F"),
                "feedback": eval_item.get("feedback", ""),
            })

        unique_strengths = list(set(all_strengths))[:5]
        unique_weaknesses = list(set(all_weaknesses))[:5]

        summary = f"Completed {answered_questions}/{total_questions} questions with an average score of {average_score}%. "
        if recommendation_level == "STRONG_HIRE":
            summary += "The candidate demonstrates strong technical and communication skills."
        elif recommendation_level == "HIRE":
            summary += "The candidate shows solid potential with room for growth."
        elif recommendation_level == "MAYBE":
            summary += "The candidate has some gaps that may need addressing."
        else:
            summary += "The candidate may not be the right fit for this role."

        return {
            "interview_id": interview_id,
            "overall_score": average_score,
            "overall_grade": self._score_to_grade(average_score),
            "summary": summary,
            "skill_radar_data": skill_radar,
            "category_scores": category_scores,
            "strengths": unique_strengths,
            "weaknesses": unique_weaknesses,
            "recommendations": f"Focus on: {', '.join(unique_weaknesses[:3]) if unique_weaknesses else 'continued growth'}",
            "recommendation_level": recommendation_level,
            "question_breakdown": question_breakdown,
        }

    def _score_to_grade(self, score: int) -> str:
        if score >= 90: return "A+"
        if score >= 80: return "A"
        if score >= 70: return "B+"
        if score >= 60: return "B"
        if score >= 50: return "C+"
        if score >= 40: return "C"
        if score >= 30: return "D"
        return "F"

    def _clean_json(self, text: str) -> str:
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            text = "\n".join(lines).strip()
        return text

    def _parse_list_field(self, value) -> List[str]:
        if isinstance(value, list):
            return [str(v) for v in value]
        if isinstance(value, str):
            value = value.strip()
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [str(v) for v in parsed]
            except Exception:
                pass
            return [value] if value else []
        return []

    async def _call_llm(self, prompt: str) -> str:
        if self.provider == "openai":
            return await self._call_openai(prompt)
        elif self.provider == "gemini":
            return await self._call_gemini(prompt)
        else:
            raise ValueError(f"Unknown LLM provider: {self.provider}")

    async def _call_openai(self, prompt: str) -> str:
        from langchain_openai import ChatOpenAI
        from langchain_core.messages import HumanMessage

        llm = ChatOpenAI(model=self.model, api_key=self.api_key)
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return response.content

    async def _call_gemini(self, prompt: str) -> str:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage

        llm = ChatGoogleGenerativeAI(model=self.model, google_api_key=self.api_key)
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return response.content

    def _generate_mock_questions(self, count: int, experience_level: str, job_description: str = "") -> List[Dict]:
        jd_lower = (job_description or "").lower()

        # Detect job field from description
        field = "general"
        if any(kw in jd_lower for kw in ["frontend", "react", "vue", "angular", "css", "html", "ui"]):
            field = "frontend"
        elif any(kw in jd_lower for kw in ["backend", "api", "server", "microservice", "spring", "django", "node"]):
            field = "backend"
        elif any(kw in jd_lower for kw in ["java", "spring boot", "hibernate"]):
            field = "java"
        elif any(kw in jd_lower for kw in ["python", "django", "flask", "fastapi"]):
            field = "python"
        elif any(kw in jd_lower for kw in ["data scientist", "machine learning", "ml", "ai engineer", "deep learning"]):
            field = "ml"
        elif any(kw in jd_lower for kw in ["data engineer", "etl", "pipeline", "spark", "airflow"]):
            field = "data"
        elif any(kw in jd_lower for kw in ["devops", "sre", "infrastructure", "kubernetes", "docker", "cloud"]):
            field = "devops"
        elif any(kw in jd_lower for kw in ["mobile", "ios", "android", "react native", "flutter"]):
            field = "mobile"
        elif any(kw in jd_lower for kw in ["full stack", "fullstack", "full-stack"]):
            field = "fullstack"
        elif any(kw in jd_lower for kw in ["qa", "test", "quality", "automation"]):
            field = "qa"
        elif any(kw in jd_lower for kw in ["security", "cyber", "penetration"]):
            field = "security"
        elif any(kw in jd_lower for kw in ["product manager", "product owner"]):
            field = "product"

        field_questions = {
            "frontend": [
                {"text": "Explain the virtual DOM in React and how it improves performance.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Virtual DOM is a lightweight copy of real DOM. React diffs virtual and real DOM, then applies minimal updates."},
                {"text": "What is the difference between CSS Grid and Flexbox? When would you use each?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Grid is 2D layout, Flexbox is 1D. Grid for page layouts, Flexbox for component-level alignment."},
                {"text": "How do you optimize a React application's performance?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Memoization, lazy loading, code splitting, virtualization, avoiding unnecessary re-renders."},
                {"text": "Explain React hooks and the rules of hooks.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Hooks are functions that let you use state and lifecycle in function components. Rules: only call at top level, only call from React functions."},
                {"text": "What is the critical rendering path?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Process browser uses to convert HTML/CSS to pixels: DOM, CSSOM, render tree, layout, paint, composite."},
                {"text": "How would you implement accessibility in a complex form?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "ARIA labels, keyboard navigation, focus management, error announcements, semantic HTML."},
                {"text": "Describe a time you had to debug a cross-browser compatibility issue.", "type": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_answer": "Use STAR method. Describe the issue, investigation process, and solution."},
                {"text": "What is server-side rendering vs client-side rendering?", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "SSR renders on server, sends HTML. CSR renders in browser with JavaScript. SSR has better SEO and initial load."},
                {"text": "How do you handle state management in a large React application?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Context API, Redux, Zustand, Jotai. Choose based on complexity. Use local state when possible."},
                {"text": "Explain CSS specificity and the box model.", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Specificity: inline > ID > class > element. Box model: content, padding, border, margin."},
            ],
            "backend": [
                {"text": "Design a RESTful API for a social media platform.", "type": "SYSTEM_DESIGN", "difficulty": "HARD", "expected_answer": "Resource-based URLs, HTTP methods, pagination, authentication, rate limiting, versioning."},
                {"text": "Explain the difference between SQL and NoSQL databases.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "SQL: relational, fixed schema, ACID. NoSQL: flexible schema, horizontal scaling, eventual consistency."},
                {"text": "How would you handle database connection pooling?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Use connection pool library, configure min/max connections, handle timeouts, monitor pool health."},
                {"text": "What is the CAP theorem?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Consistency, Availability, Partition tolerance. Can only guarantee 2 of 3 in distributed system."},
                {"text": "Explain microservices vs monolithic architecture.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Microservices: independent services, scalability, complexity. Monolith: single codebase, simpler, harder to scale."},
                {"text": "How do you ensure API security?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Authentication (JWT/OAuth), input validation, rate limiting, HTTPS, CORS, SQL injection prevention."},
                {"text": "Describe a production incident you handled.", "type": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_answer": "Use STAR method. Describe the incident, your role, actions taken, and lessons learned."},
                {"text": "What is caching and what strategies do you know?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "In-memory (Redis), CDN, browser cache. Strategies: write-through, write-behind, cache-aside."},
                {"text": "How would you design a message queue system?", "type": "SYSTEM_DESIGN", "difficulty": "HARD", "expected_answer": "Producers, consumers, topics/queues, persistence, acknowledgment, dead letter queues, scaling."},
                {"text": "Explain database indexing and when to use it.", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Index speeds up reads but slows writes. Use on WHERE, JOIN, ORDER BY columns. B-tree, hash, composite indexes."},
            ],
            "java": [
                {"text": "Explain the difference between abstract class and interface in Java.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Abstract classes can have constructors and instance variables. Interfaces define contracts."},
                {"text": "What are the SOLID principles?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion."},
                {"text": "How does garbage collection work in Java?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "JVM manages memory, identifies unreachable objects, reclaims memory. Generational collection."},
                {"text": "Explain Spring Boot dependency injection.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Spring manages object creation and injection. @Autowired, @Component, @Service annotations."},
                {"text": "What is the difference between HashMap and ConcurrentHashMap?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "HashMap not thread-safe. ConcurrentHashMap uses segment locking for thread safety."},
                {"text": "How would you optimize a slow Spring Boot application?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Connection pooling, caching, lazy loading, N+1 query fix, profiling, JVM tuning."},
                {"text": "Explain Java streams and when to use them.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Functional-style operations on collections. Use for filtering, mapping, reducing. Parallel streams for large datasets."},
                {"text": "Describe a challenging bug you fixed in production.", "type": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_answer": "Use STAR method. Describe the bug, investigation, root cause, and fix."},
                {"text": "What is the difference between synchronized and volatile?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "synchronized provides mutual exclusion. volatile ensures visibility of changes across threads."},
                {"text": "How do you handle exceptions in a Spring Boot REST API?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "@ControllerAdvice, @ExceptionHandler, custom exception classes, proper HTTP status codes."},
            ],
            "python": [
                {"text": "Explain Python decorators and give an example.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Functions that modify other functions. Use @syntax. Common: @property, @staticmethod, custom logging."},
                {"text": "What is the GIL and how does it affect threading?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Global Interpreter Lock prevents true parallelism in CPython. Use multiprocessing for CPU-bound tasks."},
                {"text": "Explain async/await in Python.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "asyncio for concurrent I/O. async def, await, event loop. Use for network calls, not CPU-bound work."},
                {"text": "What are Python generators and when to use them?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Functions that yield values lazily. Use for large datasets, infinite sequences, memory efficiency."},
                {"text": "How do you manage dependencies in a Python project?", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "pip, virtualenv, requirements.txt, poetry, pyproject.toml. Pin versions for reproducibility."},
                {"text": "Explain the difference between list and tuple.", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "List is mutable, tuple is immutable. Tuple is hashable, can be dict key. Tuple is faster."},
                {"text": "How would you design a REST API with FastAPI?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Path operations, Pydantic models, dependency injection, middleware, OpenAPI docs."},
                {"text": "Describe a time you mentored a junior developer.", "type": "BEHAVIORAL", "difficulty": "EASY", "expected_answer": "Use STAR method. Describe the situation, your approach, and the outcome."},
                {"text": "What is metaprogramming in Python?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Metaclasses, __new__, __init_subclass__, descriptors. Control class creation and behavior."},
                {"text": "How do you write testable Python code?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Dependency injection, pure functions, mocking, pytest fixtures, separation of concerns."},
            ],
            "ml": [
                {"text": "Explain the bias-variance tradeoff.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Bias: error from oversimplification. Variance: error from sensitivity to data. Balance via regularization."},
                {"text": "What is transfer learning and when would you use it?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Using pre-trained model on new task. Use when limited data, similar domain. Fine-tune last layers."},
                {"text": "How do you handle imbalanced datasets?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Oversampling (SMOTE), undersampling, class weights, different metrics (F1, AUC), anomaly detection."},
                {"text": "Explain cross-validation and why it's important.", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Split data into k folds, train on k-1, test on 1. Repeat. Gives reliable performance estimate."},
                {"text": "What is the difference between L1 and L2 regularization?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "L1 (Lasso): sparse weights, feature selection. L2 (Ridge): small weights, prevents overfitting."},
                {"text": "How would you deploy a machine learning model to production?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Model serialization, API serving, monitoring, A/B testing, versioning, retraining pipeline."},
                {"text": "Describe a project where your model didn't perform well.", "type": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_answer": "Use STAR method. Describe the problem, analysis, what you learned, and how you improved."},
                {"text": "Explain gradient descent and its variants.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Optimization algorithm. Batch, stochastic, mini-batch. Adam, RMSprop for adaptive learning rates."},
                {"text": "What is overfitting and how do you prevent it?", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Model learns noise in training data. Prevent with regularization, dropout, early stopping, more data."},
                {"text": "How do you evaluate a classification model?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Accuracy, precision, recall, F1, confusion matrix, ROC-AUC. Choose based on business requirements."},
            ],
            "devops": [
                {"text": "Explain the difference between containers and virtual machines.", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Containers share host kernel, lightweight. VMs have full OS, heavier isolation."},
                {"text": "How would you design a CI/CD pipeline?", "type": "SYSTEM_DESIGN", "difficulty": "HARD", "expected_answer": "Source control, build, test, security scan, deploy stages. Rollback strategy, environment promotion."},
                {"text": "What is Infrastructure as Code?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Managing infrastructure through code (Terraform, CloudFormation). Version controlled, reproducible, automated."},
                {"text": "Explain Kubernetes architecture.", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Master node (API server, etcd, scheduler, controller manager). Worker nodes (kubelet, kube-proxy, pods)."},
                {"text": "How do you monitor a production system?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Metrics (Prometheus), logging (ELK), tracing (Jaeger), alerting, dashboards (Grafana)."},
                {"text": "What is blue-green deployment?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Two identical environments. Switch traffic from blue to green. Easy rollback by switching back."},
                {"text": "Describe a major outage you handled.", "type": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_answer": "Use STAR method. Describe the incident, your role, resolution, and postmortem learnings."},
                {"text": "How do you ensure zero-downtime deployments?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Rolling updates, blue-green, canary deployments, database migrations, health checks."},
                {"text": "What is the difference between horizontal and vertical scaling?", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Horizontal: add more machines. Vertical: add more resources to existing machine."},
                {"text": "How do you manage secrets in a cloud environment?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Vault, AWS Secrets Manager, environment variables, encrypted config files, rotation policies."},
            ],
            "data": [
                {"text": "Explain the difference between ETL and ELT.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "ETL: transform before loading. ELT: load then transform in warehouse. ELT better for cloud."},
                {"text": "How would you design a data pipeline for real-time analytics?", "type": "SYSTEM_DESIGN", "difficulty": "HARD", "expected_answer": "Kafka for ingestion, stream processing (Flink/Spark), storage (data lake/warehouse), serving layer."},
                {"text": "What is data partitioning and why is it important?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Splitting data into smaller pieces. Improves query performance, parallel processing, manageability."},
                {"text": "How do you ensure data quality?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Validation rules, schema enforcement, monitoring, data profiling, anomaly detection, testing."},
                {"text": "Explain star schema vs snowflake schema.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Star: denormalized, faster queries. Snowflake: normalized, less redundancy, more joins."},
                {"text": "What is the difference between batch and stream processing?", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Batch: process large datasets periodically. Stream: process data in real-time as it arrives."},
                {"text": "Describe a data quality issue you resolved.", "type": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_answer": "Use STAR method. Describe the issue, investigation, root cause, and prevention measures."},
                {"text": "How do you optimize SQL queries?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "EXPLAIN plans, indexing, query rewriting, avoiding SELECT *, proper JOINs, partitioning."},
                {"text": "What is data lineage and why does it matter?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Tracking data from source to destination. Important for debugging, compliance, trust."},
                {"text": "How would you handle schema evolution in a data pipeline?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Schema registry, backward/forward compatibility, versioning, migration scripts, testing."},
            ],
            "fullstack": [
                {"text": "How do you handle authentication across frontend and backend?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "JWT tokens, HTTP-only cookies, refresh tokens, OAuth2, session management, CSRF protection."},
                {"text": "Explain the request lifecycle from browser to database.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "DNS, TCP, HTTP request, server routing, middleware, controller, ORM, database, response."},
                {"text": "How would you optimize a full-stack application's performance?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "CDN, caching, lazy loading, database optimization, code splitting, SSR, compression."},
                {"text": "What is CORS and how do you handle it?", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Cross-Origin Resource Sharing. Server sends Access-Control-Allow-Origin header. Proxy for development."},
                {"text": "How do you manage environment variables and configuration?", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": ".env files, environment-specific configs, secrets management, 12-factor app principles."},
                {"text": "Describe a full-stack feature you built end-to-end.", "type": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_answer": "Use STAR method. Describe the feature, your approach, challenges, and outcome."},
                {"text": "How do you handle errors across the full stack?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Global error handlers, proper HTTP status codes, error boundaries in React, logging, user-friendly messages."},
                {"text": "What is server-side rendering and when to use it?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Rendering on server, sending HTML. Use for SEO, initial load performance, social media previews."},
                {"text": "How do you test a full-stack application?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Unit tests, integration tests, E2E tests (Playwright/Cypress), API tests, mocking."},
                {"text": "Explain database migrations and version control.", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Version-controlled schema changes. Tools: Flyway, Alembic, Prisma Migrate. Up/down migrations."},
            ],
            "mobile": [
                {"text": "Explain the difference between native and cross-platform development.", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Native: platform-specific (Swift/Kotlin). Cross-platform: shared code (React Native/Flutter). Trade-offs in performance and development speed."},
                {"text": "How do you handle offline support in a mobile app?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Local storage, sync queues, conflict resolution, optimistic updates, background sync."},
                {"text": "What is the mobile app lifecycle?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Active, inactive, background, suspended. Handle state preservation, cleanup, and restoration."},
                {"text": "How do you optimize mobile app performance?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Image optimization, lazy loading, memory management, reducing re-renders, profiling tools."},
                {"text": "Describe a challenging mobile bug you fixed.", "type": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_answer": "Use STAR method. Describe the bug, investigation, platform-specific issues, and solution."},
                {"text": "How do you handle push notifications?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "FCM/APNS, notification channels, deep linking, background handling, permission management."},
                {"text": "What is responsive design for mobile?", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Adapting UI to different screen sizes. Breakpoints, flexible layouts, touch targets, orientation."},
                {"text": "How do you manage app state in React Native?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Context API, Redux, Zustand, React Query for server state. Local state with useState/useReducer."},
                {"text": "Explain mobile app security best practices.", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Secure storage, certificate pinning, code obfuscation, root/jailbreak detection, API security."},
                {"text": "How do you test mobile applications?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Unit tests, integration tests, E2E (Detox/Appium), device farms, beta testing (TestFlight/Firebase)."},
            ],
            "qa": [
                {"text": "Explain the testing pyramid.", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Many unit tests, fewer integration tests, few E2E tests. Fast, reliable, cost-effective."},
                {"text": "How do you design a test automation framework?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Page object model, data-driven, keyword-driven, reporting, CI integration, parallel execution."},
                {"text": "What is the difference between regression and smoke testing?", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Smoke: quick check of critical features. Regression: comprehensive test of existing functionality after changes."},
                {"text": "How do you handle flaky tests?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Identify root cause, add retries, fix timing issues, isolate dependencies, quarantine and track."},
                {"text": "Explain API testing strategies.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Contract testing, schema validation, status codes, response times, error handling, security testing."},
                {"text": "Describe a critical bug you found before release.", "type": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_answer": "Use STAR method. Describe the bug, how you found it, impact, and prevention measures."},
                {"text": "How do you prioritize test cases?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Risk-based, business impact, frequency of use, complexity, recent changes, defect history."},
                {"text": "What is performance testing?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Load, stress, endurance, spike testing. Tools: JMeter, Gatling, k6. Measure response time, throughput."},
                {"text": "How do you test accessibility?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "WCAG guidelines, screen readers, keyboard navigation, color contrast, automated tools (axe, Lighthouse)."},
                {"text": "Explain continuous testing in CI/CD.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Automated tests in pipeline. Shift-left testing. Fast feedback. Quality gates."},
            ],
            "security": [
                {"text": "Explain the OWASP Top 10 vulnerabilities.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Injection, broken auth, sensitive data exposure, XSS, CSRF, security misconfiguration, etc."},
                {"text": "How would you conduct a security audit?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Scope definition, automated scanning, manual testing, code review, reporting, remediation tracking."},
                {"text": "What is the principle of least privilege?", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Grant minimum permissions needed. Reduces attack surface. Apply to users, services, and applications."},
                {"text": "Explain SQL injection and how to prevent it.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Injecting SQL via user input. Prevent with parameterized queries, ORM, input validation, WAF."},
                {"text": "How do you handle a security incident?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Detection, containment, eradication, recovery, lessons learned. Communication plan, forensics."},
                {"text": "Describe a security vulnerability you discovered.", "type": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_answer": "Use STAR method. Describe the vulnerability, discovery process, impact, and responsible disclosure."},
                {"text": "What is zero trust architecture?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Never trust, always verify. Micro-segmentation, continuous authentication, least privilege access."},
                {"text": "How do you secure an API?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Authentication, authorization, rate limiting, input validation, HTTPS, API keys, OAuth2."},
                {"text": "Explain encryption at rest vs in transit.", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "At rest: data stored encrypted (AES). In transit: data moving encrypted (TLS/SSL). Both needed."},
                {"text": "What is a penetration testing methodology?", "type": "TECHNICAL", "difficulty": "HARD", "expected_answer": "Reconnaissance, scanning, exploitation, post-exploitation, reporting. PTES, OWASP testing guide."},
            ],
            "product": [
                {"text": "How do you prioritize features?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "RICE, MoSCoW, Kano model, impact vs effort matrix. Consider business value, user needs, technical debt."},
                {"text": "Explain your product development process.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Discovery, definition, design, development, testing, launch, iteration. User research at each stage."},
                {"text": "How do you measure product success?", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "KPIs, OKRs, user metrics (retention, engagement), business metrics (revenue, conversion), NPS."},
                {"text": "Describe a product decision that didn't go as planned.", "type": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_answer": "Use STAR method. Describe the decision, what went wrong, what you learned, and how you adapted."},
                {"text": "How do you gather and incorporate user feedback?", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "User interviews, surveys, analytics, support tickets, A/B testing, usability testing."},
                {"text": "What is product-market fit?", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "When product satisfies strong market demand. Measured by retention, NPS, organic growth."},
                {"text": "How do you work with engineering teams?", "type": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_answer": "Clear requirements, prioritization, sprint planning, stakeholder management, data-driven decisions."},
                {"text": "Explain A/B testing and when to use it.", "type": "TECHNICAL", "difficulty": "MEDIUM", "expected_answer": "Compare two versions to see which performs better. Use for UI changes, features, pricing. Statistical significance."},
                {"text": "How do you handle conflicting stakeholder requirements?", "type": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_answer": "Use STAR method. Describe the conflict, your approach to resolution, and outcome."},
                {"text": "What makes a good product requirements document?", "type": "TECHNICAL", "difficulty": "EASY", "expected_answer": "Clear problem statement, user stories, acceptance criteria, success metrics, constraints, timeline."},
            ],
        }

        # Get field-specific questions or fall back to general
        questions = field_questions.get(field, field_questions["backend"])

        # Adjust difficulty based on experience level
        if experience_level == "JUNIOR":
            questions = [q for q in questions if q["difficulty"] in ["EASY", "MEDIUM"]] + questions[:2]
        elif experience_level == "SENIOR":
            questions = [q for q in questions if q["difficulty"] in ["MEDIUM", "HARD"]] + questions[:2]
        elif experience_level in ["LEAD", "ARCHITECT"]:
            questions = [q for q in questions if q["difficulty"] in ["HARD", "EXPERT"]] + questions[:2]

        return questions[:count]
