#!/usr/bin/env python3
"""Scrape interview questions from job boards using crawl4ai"""

import asyncio
import json
import os

# Question categories for different roles
CATEGORIES = {
    "frontend": [
        "React hooks", "CSS layout", "performance optimization", 
        "state management", "testing", "accessibility", "design patterns"
    ],
    "backend": [
        "API design", "database optimization", "caching", 
        "microservices", "security", "scalability", "error handling"
    ],
    "fullstack": [
        "system design", "API integration", "database design", 
        "deployment", "testing", "DevOps", "authentication"
    ],
    "data": [
        "SQL queries", "data modeling", "ETL", 
        "machine learning", "statistics", "visualization"
    ],
    "devops": [
        "Docker", "Kubernetes", "CI/CD", 
        "cloud architecture", "monitoring", "Linux"
    ]
}

async def scrape_questions(category: str, topics: list) -> list:
    """Scrape interview questions for a category"""
    try:
        from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
        
        questions = []
        
        # Search queries for each topic
        for topic in topics[:3]:  # Limit to 3 topics per category
            query = f"interview questions {topic} {category} developer"
            search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
            
            browser_config = BrowserConfig(headless=True)
            run_config = CrawlerRunConfig(
                word_count_threshold=10,
                bypass_cache=True
            )
            
            async with AsyncWebCrawler(config=browser_config) as crawler:
                result = await crawler.arun(url=search_url, config=run_config)
                
                if result.success:
                    # Extract questions from search results
                    content = result.markdown
                    # Simple extraction - look for question patterns
                    lines = content.split('\n')
                    for line in lines:
                        line = line.strip()
                        if '?' in line and len(line) > 20 and len(line) < 200:
                            if not any(skip in line.lower() for skip in ['search', 'google', 'cookie', 'privacy']):
                                questions.append({
                                    'text': line.rstrip('?').strip() + '?',
                                    'type': 'TECHNICAL',
                                    'difficulty': 'MEDIUM',
                                    'expected_answer': f'Strong answer covering key concepts of {topic}.'
                                })
        
        return questions[:50]  # Limit per category
    except Exception as e:
        print(f"Error scraping {category}: {e}")
        return []

async def main():
    print("=== Scraping Interview Questions ===")
    print("")
    
    all_questions = {}
    
    for category, topics in CATEGORIES.items():
        print(f"Scraping {category}...")
        questions = await scrape_questions(category, topics)
        all_questions[category] = questions
        print(f"  Found {len(questions)} questions")
    
    # Save to files
    output_dir = "/home/abhijitk20/ai interviwer/backend/src/main/resources/question-banks"
    
    for category, questions in all_questions.items():
        if questions:
            filename = f"{category}-scraped.json"
            filepath = os.path.join(output_dir, filename)
            
            # Load existing questions if any
            existing = []
            if os.path.exists(filepath.replace('-scraped', '')):
                with open(filepath.replace('-scraped', '')) as f:
                    existing = json.load(f)
            
            # Merge and deduplicate
            all_q = existing + questions
            seen = set()
            unique = [q for q in all_q if q['text'] not in seen and not seen.add(q['text'])]
            
            # Save to original file
            with open(filepath.replace('-scraped', ''), 'w') as f:
                json.dump(unique[:200], f, indent=2)
            
            print(f"  Saved {len(unique[:200])} questions to {category}.json")
    
    print("")
    print("=== Done ===")

if __name__ == "__main__":
    asyncio.run(main())
