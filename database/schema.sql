-- AI Interviewer Database Schema
-- MySQL / MariaDB compatible

CREATE DATABASE IF NOT EXISTS ai_interviewer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_interviewer;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('CANDIDATE', 'ADMIN', 'RECRUITER') NOT NULL DEFAULT 'CANDIDATE',
    phone VARCHAR(20),
    profile_summary VARCHAR(500),
    linkedin_url VARCHAR(200),
    github_url VARCHAR(200),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('PROGRAMMING_LANGUAGE', 'FRAMEWORK', 'DATABASE', 'CLOUD', 'DEVOPS',
                  'DATA_STRUCTURE', 'ALGORITHM', 'SYSTEM_DESIGN', 'SOFT_SKILL', 'OTHER')
                  NOT NULL DEFAULT 'OTHER',
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size VARCHAR(100),
    extracted_text TEXT,
    parsed_data JSON,
    status ENUM('UPLOADED', 'PARSING', 'PARSED', 'FAILED') NOT NULL DEFAULT 'UPLOADED',
    error_message VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job descriptions table
CREATE TABLE IF NOT EXISTS job_descriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_by BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    parsed_requirements JSON,
    experience_level ENUM('JUNIOR', 'MID', 'SENIOR', 'LEAD', 'ARCHITECT') NOT NULL DEFAULT 'MID',
    location VARCHAR(100),
    employment_type VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resume-JD matches table
CREATE TABLE IF NOT EXISTS resume_jd_matches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    job_description_id BIGINT NOT NULL,
    match_score DOUBLE NOT NULL,
    matched_skills JSON,
    missing_skills JSON,
    analysis_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (job_description_id) REFERENCES job_descriptions(id) ON DELETE CASCADE,
    INDEX idx_resume_id (resume_id),
    INDEX idx_jd_id (job_description_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    type ENUM('TECHNICAL', 'BEHAVIORAL', 'SITUATIONAL', 'CODING', 'SYSTEM_DESIGN', 'STAR')
         NOT NULL DEFAULT 'TECHNICAL',
    difficulty ENUM('EASY', 'MEDIUM', 'HARD', 'EXPERT') NOT NULL DEFAULT 'MEDIUM',
    expected_answer TEXT,
    evaluation_criteria JSON,
    source VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_difficulty (difficulty),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Question-Skills junction table
CREATE TABLE IF NOT EXISTS question_skills (
    question_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (question_id, skill_id),
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    job_description_id BIGINT,
    resume_id BIGINT,
    title VARCHAR(200) NOT NULL,
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED')
           NOT NULL DEFAULT 'SCHEDULED',
    mode ENUM('TEXT', 'VOICE', 'VIDEO', 'CODING') NOT NULL DEFAULT 'TEXT',
    total_questions INT NOT NULL DEFAULT 10,
    current_question_index INT NOT NULL DEFAULT 0,
    duration_minutes INT NOT NULL DEFAULT 60,
    notes VARCHAR(500),
    interview_config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_description_id) REFERENCES job_descriptions(id) ON DELETE SET NULL,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL,
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Interview sessions table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    question_order INT NOT NULL,
    candidate_answer TEXT,
    ai_follow_up TEXT,
    follow_up_answer TEXT,
    status ENUM('PENDING', 'ANSWERED', 'EVALUATED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
    difficulty_used VARCHAR(20),
    question_type VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    answered_at TIMESTAMP NULL,
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_interview_id (interview_id),
    INDEX idx_question_order (question_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL UNIQUE,
    score INT NOT NULL,
    grade VARCHAR(20),
    feedback TEXT,
    skill_scores JSON,
    strengths JSON,
    weaknesses JSON,
    improvement_suggestions TEXT,
    confidence_level VARCHAR(30),
    communication_score VARCHAR(30),
    technical_depth VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL UNIQUE,
    overall_score INT NOT NULL,
    overall_grade VARCHAR(20),
    summary TEXT,
    skill_radar_data JSON,
    category_scores JSON,
    strengths JSON,
    weaknesses JSON,
    recommendations TEXT,
    question_breakdown JSON,
    recommendation_level VARCHAR(30),
    pdf_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    INDEX idx_interview_id (interview_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed data: Skills
INSERT INTO skills (name, category, description) VALUES
('Java', 'PROGRAMMING_LANGUAGE', 'Java programming language'),
('Python', 'PROGRAMMING_LANGUAGE', 'Python programming language'),
('JavaScript', 'PROGRAMMING_LANGUAGE', 'JavaScript programming language'),
('TypeScript', 'PROGRAMMING_LANGUAGE', 'TypeScript programming language'),
('Spring Boot', 'FRAMEWORK', 'Spring Boot framework'),
('React', 'FRAMEWORK', 'React JavaScript library'),
('Node.js', 'FRAMEWORK', 'Node.js runtime'),
('MySQL', 'DATABASE', 'MySQL database'),
('PostgreSQL', 'DATABASE', 'PostgreSQL database'),
('MongoDB', 'DATABASE', 'MongoDB database'),
('AWS', 'CLOUD', 'Amazon Web Services'),
('Docker', 'DEVOPS', 'Docker containerization'),
('Kubernetes', 'DEVOPS', 'Kubernetes orchestration'),
('Data Structures', 'DATA_STRUCTURE', 'Data structures and algorithms'),
('Algorithms', 'ALGORITHM', 'Algorithm design and analysis'),
('System Design', 'SYSTEM_DESIGN', 'System design and architecture'),
('Communication', 'SOFT_SKILL', 'Communication skills'),
('Problem Solving', 'SOFT_SKILL', 'Problem solving skills')
ON DUPLICATE KEY UPDATE name=name;

-- Seed data: Sample questions
INSERT INTO questions (text, type, difficulty, expected_answer) VALUES
('Explain the difference between abstract class and interface in Java.', 'TECHNICAL', 'MEDIUM',
 'Abstract classes can have constructors, instance variables, and concrete methods. Interfaces can only have abstract methods (before Java 8), default methods, and static methods. A class can implement multiple interfaces but extend only one abstract class.'),
('What is the time complexity of binary search?', 'TECHNICAL', 'EASY',
 'O(log n) - binary search divides the search space in half with each comparison.'),
('Describe a challenging project you worked on and how you overcame obstacles.', 'BEHAVIORAL', 'MEDIUM',
 'Candidate should use STAR method: Situation, Task, Action, Result. Look for specific examples, problem-solving approach, and measurable outcomes.'),
('Design a URL shortening service like bit.ly.', 'SYSTEM_DESIGN', 'HARD',
 'Should cover: API design, database schema, hash generation, collision handling, caching, scalability, analytics.'),
('Explain the difference between process and thread.', 'TECHNICAL', 'EASY',
 'A process is an independent program with its own memory space. A thread is a lightweight subprocess that shares memory with other threads in the same process.'),
('What is dependency injection and why is it useful?', 'TECHNICAL', 'MEDIUM',
 'Dependency injection is a design pattern where dependencies are provided to a class rather than the class creating them. It promotes loose coupling, testability, and follows the Inversion of Control principle.'),
('How would you optimize a slow database query?', 'TECHNICAL', 'HARD',
 'Should mention: EXPLAIN analysis, indexing, query rewriting, caching, denormalization, partitioning, connection pooling.'),
('Tell me about a time you had to learn a new technology quickly.', 'BEHAVIORAL', 'EASY',
 'Look for: learning strategy, resources used, time frame, practical application, and outcome.'),
('What is the difference between SQL and NoSQL databases?', 'TECHNICAL', 'MEDIUM',
 'SQL: relational, schema-based, ACID compliant, vertical scaling. NoSQL: non-relational, flexible schema, BASE properties, horizontal scaling.'),
('Explain the SOLID principles.', 'TECHNICAL', 'MEDIUM',
 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.')
ON DUPLICATE KEY UPDATE text=text;

-- Seed data: Admin user (password: admin123)
INSERT INTO users (email, password, full_name, role) VALUES
('admin@interviewer.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Admin', 'ADMIN')
ON DUPLICATE KEY UPDATE email=email;
