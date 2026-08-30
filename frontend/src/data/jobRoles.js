export const JOB_ROLES = [
  {
    title: "Frontend Developer",
    category: "Engineering",
    skills: ["React", "JavaScript", "TypeScript", "CSS", "HTML", "Next.js", "Vue.js"],
    description: "Build and maintain user-facing web applications using modern JavaScript frameworks. Focus on responsive design, performance optimization, and accessibility.",
    questionTopics: ["React hooks", "CSS layout", "performance optimization", "state management", "browser rendering", "accessibility", "component design patterns"],
  },
  {
    title: "Backend Developer",
    category: "Engineering",
    skills: ["Java", "Python", "Node.js", "REST APIs", "SQL", "Microservices", "Docker"],
    description: "Design and implement server-side logic, databases, and APIs. Ensure scalability, security, and performance of backend systems.",
    questionTopics: ["API design", "database optimization", "caching strategies", "microservices architecture", "security", "scalability", "error handling"],
  },
  {
    title: "Full Stack Developer",
    category: "Engineering",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "REST APIs"],
    description: "Develop both client and server-side applications. Work across the entire stack from database to UI.",
    questionTopics: ["system design", "API integration", "database design", "frontend-backend communication", "deployment", "testing strategies"],
  },
  {
    title: "Java Developer",
    category: "Engineering",
    skills: ["Java", "Spring Boot", "Hibernate", "Maven", "MySQL", "REST APIs", "JUnit"],
    description: "Build enterprise-grade Java applications using Spring Boot and related frameworks. Focus on clean code, testing, and scalability.",
    questionTopics: ["OOP concepts", "Spring framework", "JPA/Hibernate", "multithreading", "JVM internals", "design patterns", "Java collections"],
  },
  {
    title: "Python Developer",
    category: "Engineering",
    skills: ["Python", "Django", "Flask", "FastAPI", "SQLAlchemy", "pytest", "asyncio"],
    description: "Develop Python applications for web, data, or automation. Write clean, tested, and maintainable code.",
    questionTopics: ["Python internals", "async/await", "decorators", "generators", "testing", "web frameworks", "data structures"],
  },
  {
    title: "AI/ML Engineer",
    category: "Engineering",
    skills: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "NLP", "Computer Vision", "MLOps"],
    description: "Design, train, and deploy machine learning models. Work on NLP, computer vision, and recommendation systems.",
    questionTopics: ["neural networks", "model training", "feature engineering", "overfitting/underfitting", "transfer learning", "MLOps", "evaluation metrics"],
  },
  {
    title: "DevOps Engineer",
    category: "Engineering",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Linux", "Monitoring"],
    description: "Automate deployment pipelines, manage cloud infrastructure, and ensure system reliability.",
    questionTopics: ["containerization", "orchestration", "CI/CD pipelines", "infrastructure as code", "monitoring", "incident response", "cloud architecture"],
  },
  {
    title: "Data Engineer",
    category: "Data",
    skills: ["Python", "SQL", "Spark", "Airflow", "Kafka", "AWS", "Data Warehousing"],
    description: "Build and maintain data pipelines, warehouses, and ETL processes. Ensure data quality and availability.",
    questionTopics: ["data modeling", "ETL pipelines", "data quality", "streaming vs batch", "SQL optimization", "data warehousing", "schema design"],
  },
  {
    title: "Data Scientist",
    category: "Data",
    skills: ["Python", "R", "SQL", "Statistics", "Machine Learning", "Pandas", "Visualization"],
    description: "Analyze complex datasets to extract insights and build predictive models. Communicate findings to stakeholders.",
    questionTopics: ["statistical analysis", "hypothesis testing", "A/B testing", "feature selection", "model interpretation", "data visualization", "business metrics"],
  },
  {
    title: "Data Analyst",
    category: "Data",
    skills: ["SQL", "Excel", "Python", "Tableau", "Power BI", "Statistics", "Data Visualization"],
    description: "Analyze data to help businesses make informed decisions. Create dashboards and reports.",
    questionTopics: ["SQL queries", "data cleaning", "visualization best practices", "KPI definition", "trend analysis", "reporting", "business acumen"],
  },
  {
    title: "Cloud Architect",
    category: "Engineering",
    skills: ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Networking", "Security"],
    description: "Design and implement cloud-native solutions. Ensure scalability, security, and cost optimization.",
    questionTopics: ["cloud services", "architecture patterns", "cost optimization", "security best practices", "migration strategies", "multi-cloud", "disaster recovery"],
  },
  {
    title: "Mobile Developer",
    category: "Engineering",
    skills: ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android", "Mobile UI"],
    description: "Build native and cross-platform mobile applications for iOS and Android.",
    questionTopics: ["mobile architecture", "state management", "offline support", "push notifications", "app store deployment", "performance", "responsive design"],
  },
  {
    title: "QA Engineer",
    category: "Engineering",
    skills: ["Selenium", "Playwright", "Cypress", "JUnit", "pytest", "API Testing", "CI/CD"],
    description: "Ensure software quality through manual and automated testing. Design test strategies and frameworks.",
    questionTopics: ["test strategies", "automation frameworks", "API testing", "performance testing", "test data management", "CI/CD integration", "bug reporting"],
  },
  {
    title: "System Design Architect",
    category: "Engineering",
    skills: ["System Design", "Distributed Systems", "Caching", "Load Balancing", "Databases", "Microservices"],
    description: "Design large-scale distributed systems. Make architectural decisions for scalability and reliability.",
    questionTopics: ["scalability", "consistency vs availability", "caching strategies", "database selection", "message queues", "load balancing", "CAP theorem"],
  },
  {
    title: "Cybersecurity Engineer",
    category: "Security",
    skills: ["Network Security", "Penetration Testing", "SIEM", "Incident Response", "Cryptography", "OWASP"],
    description: "Protect systems and data from cyber threats. Implement security controls and respond to incidents.",
    questionTopics: ["threat modeling", "vulnerability assessment", "incident response", "security architecture", "compliance", "encryption", "access control"],
  },
  {
    title: "Product Manager",
    category: "Product",
    skills: ["Product Strategy", "User Research", "Agile", "Data Analysis", "Roadmapping", "Stakeholder Management"],
    description: "Define product vision and strategy. Work with engineering and design to deliver user-centric products.",
    questionTopics: ["product strategy", "prioritization frameworks", "user research", "metrics definition", "stakeholder management", "agile methodology", "market analysis"],
  },
  {
    title: "UI/UX Designer",
    category: "Design",
    skills: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems", "Accessibility"],
    description: "Design intuitive and visually appealing user interfaces. Conduct user research and usability testing.",
    questionTopics: ["design process", "user research methods", "accessibility", "design systems", "prototyping", "usability testing", "visual design principles"],
  },
  {
    title: "Site Reliability Engineer",
    category: "Engineering",
    skills: ["Linux", "Docker", "Kubernetes", "Monitoring", "Incident Response", "Automation", "Go"],
    description: "Ensure system reliability and availability. Automate operations and respond to incidents.",
    questionTopics: ["SLIs/SLOs", "incident management", "capacity planning", "automation", "monitoring", "postmortems", "chaos engineering"],
  },
  {
    title: "Blockchain Developer",
    category: "Engineering",
    skills: ["Solidity", "Ethereum", "Web3.js", "Smart Contracts", "DeFi", "Cryptography"],
    description: "Develop decentralized applications and smart contracts on blockchain platforms.",
    questionTopics: ["smart contract security", "consensus mechanisms", "gas optimization", "DeFi protocols", "token standards", "testing", "upgradeability"],
  },
  {
    title: "Game Developer",
    category: "Engineering",
    skills: ["Unity", "Unreal Engine", "C#", "C++", "3D Math", "Physics", "Game Design"],
    description: "Design and develop video games for various platforms.",
    questionTopics: ["game loops", "physics simulation", "AI in games", "rendering pipelines", "networking", "optimization", "game design patterns"],
  },
]

export const JOB_CATEGORIES = [...new Set(JOB_ROLES.map(r => r.category))]

export const getRolesByCategory = (category) =>
  JOB_ROLES.filter(r => r.category === category)

export const searchRoles = (query) => {
  const q = query.toLowerCase()
  return JOB_ROLES.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.skills.some(s => s.toLowerCase().includes(q)) ||
    r.category.toLowerCase().includes(q)
  )
}
