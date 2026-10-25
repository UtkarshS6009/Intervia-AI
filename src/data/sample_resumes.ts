export interface SampleResume {
  id: string;
  name: string;
  targetRole: string;
  filename: string;
  text: string;
}

export const SAMPLE_RESUMES: SampleResume[] = [
  {
    id: "ml-engineer",
    name: "Aria Chen",
    targetRole: "Machine Learning Engineer",
    filename: "Aria_Chen_ML_Engineer_Resume.pdf",
    text: `Aria Chen
aria.chen.ai@example.com | (555) 234-5678 | San Francisco, CA | github.com/ariachen-ai

PROFESSIONAL SUMMARY
Senior Machine Learning Engineer with 4+ years of experience designing and deploying scalable deep learning and NLP architectures in production. Proven track record improving fraud detection precision by 34% and building enterprise RAG systems with FAISS and Transformer models.

TECHNICAL SKILLS
• Programming Languages: Python, SQL, C++, Bash
• Machine Learning & DL: PyTorch, TensorFlow, Scikit-Learn, XGBoost, Transformers, CNN, BERT, ResNet
• NLP & GenAI: LangChain, LlamaIndex, spaCy, Hugging Face, FAISS, Vector Databases, Prompt Engineering
• Data & Databases: PostgreSQL, Redis, Pandas, NumPy, Spark
• Cloud & DevOps: AWS (SageMaker, S3, EC2), Docker, Kubernetes, MLflow, CI/CD, Git

WORK EXPERIENCE
Senior Machine Learning Engineer | Nexus AI Labs | 2022 - Present
• Designed an end-to-end Payment Fraud Detection System processing 4.2M daily transactions using Random Forest and XGBoost with cost-sensitive loss for severe class imbalance.
• Deployed an enterprise RAG knowledge assistant leveraging FAISS similarity search, Hugging Face embeddings, and Gemini API, reducing support query latency by 45%.
• Architected continuous training ML pipelines using MLflow and Docker, reducing model drift retraining cycles from 3 weeks to 4 days.

Machine Learning Engineer | DataVision Analytics | 2020 - 2022
• Built real-time sentiment analysis and Named Entity Recognition (NER) pipelines using spaCy and BERT for financial news feeds.
• Optimized model inference latency using TensorRT and ONNX runtime, achieving 3x throughput improvements on GPU clusters.

PROJECTS
• AutoRAG Search Engine: Distributed semantic search platform combining hybrid dense-sparse retrieval (BM25 + FAISS) with cross-encoder re-ranking.
• Computer Vision Anomaly Detector: Unsupervised visual inspection model utilizing deep autoencoders for manufacturing defect detection.

EDUCATION
• M.S. in Computer Science (Artificial Intelligence Focus) | Stanford University, 2020
• B.S. in Data Science & Mathematics | UC Berkeley, 2018

CERTIFICATIONS
• AWS Certified Machine Learning - Specialty
• DeepLearning.AI Deep Learning Specialization`
  },
  {
    id: "fullstack-engineer",
    name: "Marcus Reynolds",
    targetRole: "Senior Full Stack Engineer",
    filename: "Marcus_Reynolds_FullStack_Resume.pdf",
    text: `Marcus Reynolds
marcus.reynolds.dev@example.com | (555) 876-5432 | Seattle, WA | linkedin.com/in/mreynolds

SUMMARY
Full Stack Software Engineer with 5+ years of experience architecting high-throughput web applications, microservices, and reactive frontend experiences. Expert in TypeScript, React, Node.js, and PostgreSQL.

TECHNICAL SKILLS
• Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
• Frontend: React, Next.js, Tailwind CSS, Redux, Vite, WebSockets
• Backend & API: Node.js, Express, FastAPI, REST API, GraphQL, Redis
• Databases: PostgreSQL, MySQL, MongoDB, SQLite
• Cloud & Tools: AWS, Docker, GitHub Actions, Linux, Jest, Postman

EXPERIENCE
Lead Full Stack Engineer | CloudScale Systems | 2021 - Present
• Engineered multi-tenant SaaS dashboard serving 180,000 active monthly users with 99.95% uptime SLA using React and Node.js.
• Migrated monolithic REST API to high-efficiency microservices architecture with Redis caching, reducing average response time from 380ms to 75ms.
• Spearheaded frontend design system and test automation suite, accelerating team sprint velocity by 25%.

Software Engineer | FinTech Innovations | 2019 - 2021
• Developed real-time portfolio tracking interface with interactive charting and WebSocket streaming updates.
• Authored complex PostgreSQL schemas, optimized query indexing, and integrated Stripe billing webhooks.

PROJECTS
• DevCollab: Real-time collaborative markdown and code editor built with React, WebSockets, and operational transforms.
• Distributed Task Scheduler: Background worker queuing system built in Node.js and Redis supporting retry policies and dead-letter queues.

EDUCATION
• B.S. in Computer Science | University of Washington, 2019

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate`
  }
];
