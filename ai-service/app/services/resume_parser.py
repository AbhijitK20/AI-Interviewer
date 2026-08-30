import re
from typing import Dict, List


class ResumeParser:
    def __init__(self):
        self.skill_keywords = {
            "programming_languages": [
                "java", "python", "javascript", "typescript", "c++", "c#", "go", "rust",
                "ruby", "php", "swift", "kotlin", "scala"
            ],
            "frameworks": [
                "spring", "spring boot", "react", "angular", "vue", "django", "flask",
                "express", "node.js", "laravel", "rails", "fastapi"
            ],
            "databases": [
                "mysql", "postgresql", "mongodb", "redis", "oracle", "sql server",
                "cassandra", "dynamodb", "elasticsearch"
            ],
            "cloud": [
                "aws", "azure", "gcp", "google cloud", "amazon web services",
                "lambda", "ec2", "s3", "docker", "kubernetes"
            ],
            "tools": [
                "git", "jenkins", "ci/cd", "terraform", "ansible", "grafana",
                "prometheus", "jira", "agile", "scrum"
            ]
        }

    def parse(self, resume_text: str) -> Dict:
        skills = self._extract_skills(resume_text)
        experience = self._extract_experience(resume_text)
        education = self._extract_education(resume_text)
        contact = self._extract_contact(resume_text)

        return {
            "skills": skills,
            "experience": experience,
            "education": education,
            "contact": contact,
            "summary": resume_text[:500] if resume_text else ""
        }

    def _extract_skills(self, text: str) -> Dict[str, List[str]]:
        text_lower = text.lower()
        found_skills = {}

        for category, keywords in self.skill_keywords.items():
            found = []
            for keyword in keywords:
                if keyword in text_lower:
                    found.append(keyword.title())
            found_skills[category] = found

        return found_skills

    def _extract_experience(self, text: str) -> List[Dict]:
        experience_patterns = [
            r"(\d+)\+?\s*years?\s*(?:of\s*)?experience",
            r"experience[:\s]*(\d+)\+?\s*years?",
        ]

        years = 0
        for pattern in experience_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                years = int(match.group(1))
                break

        return [{"total_years": years}]

    def _extract_education(self, text: str) -> List[Dict]:
        education = []
        degree_patterns = [
            r"(Bachelor|Master|PhD|B\.?Tech|M\.?Tech|B\.?E|M\.?E|B\.?Sc|M\.?Sc)[^,\n]*",
            r"(B\.?S\.|M\.?S\.|B\.?A\.|M\.?A\.)[^,\n]*",
        ]

        for pattern in degree_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                education.append({"degree": match.strip()})

        return education

    def _extract_contact(self, text: str) -> Dict:
        email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
        phone_pattern = r"[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}"

        email_match = re.search(email_pattern, text)
        phone_match = re.search(phone_pattern, text)

        return {
            "email": email_match.group(0) if email_match else None,
            "phone": phone_match.group(0) if phone_match else None
        }
