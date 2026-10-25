# 🚀 AI Interview Coach V3

A privacy-first, multi-modal technical interview preparation platform powered by **Local LLMs (Ollama)**, **Edge-AI Computer Vision (Google MediaPipe)**, and an **Isolated Python Code Execution Sandbox (RCE)**. 

Designed to simulate high-stakes engineering interviews (Google, Meta, and high-growth startup styles) with real-time biometric focus tracking, voice dictation, automated unit-test execution, and granular Big-O complexity analysis.

---

## ✨ Key Features

### 🧠 1. Adaptive AI Mock Interview Arena
* **Dynamic Question Routing:** Generates role-specific and company-styled technical questions that adapt difficulty based on your previous answers.
* **5-Dimension Rubric Scorecard:** Evaluates responses across Technical Accuracy, Architectural Depth, Communication Clarity, Trade-off Analysis, and Production Readiness.
* **Resilient Evaluation Engine:** Seamlessly falls back to a deterministic local rubric analyzer if the local LLM server is offline.

### 👁️ 2. Real-Time Edge-AI Focus Telemetry
* **Google MediaPipe Integration:** Runs the lightweight `BlazeFace` WebAssembly model directly in the browser—bypassing OS-specific hardware limitations.
* **Live Biometric Feedback:** Scans video frames twice per second to calculate a real-time **Focus Score (%)**, alerting candidates when they look away or leave the frame.

### ⚡ 3. Live Coding Sandbox & Big-O Analyzer
* **Isolated Subprocess Runner:** Executes candidate Python code in temporary, sandboxed environments with strict 3-second timeout protection against infinite loops (`while True:`).
* **Automated Unit Test Injection:** Dynamically appends hidden `assert` test suites (LeetCode `class Solution` style) to verify algorithmic correctness.
* **AI Code Review:** Combines raw `STDOUT`/`STDERR` execution logs with LLM static analysis to grade **Time Complexity**, **Space Complexity**, and code quality.

### 🎙️ 4. Multi-Modal Voice & Audio Engine
* **Hands-Free Dictation:** Real-time speech-to-text transcription using the native Web Speech API (`SpeechRecognition`).
* **Interviewer Read-Aloud:** Built-in text-to-speech (`speechSynthesis`) for an authentic conversational interview feel.

### 📄 5. Resume RAG & Personalized Learning Roadmaps
* **Contextual Parsing:** Extracts skills and project history from uploaded resumes to ask targeted deep-dive questions.
* **Actionable Curriculums:** Generates customized study roadmaps highlighting missing concepts identified during mock sessions.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite 8, Tailwind CSS v4 (Glassmorphism UI), Lucide Icons |
| **Edge AI & Media** | Google MediaPipe (`@mediapipe/tasks-vision` WASM), Web Speech API, WebRTC (`getUserMedia`) |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Gunicorn, Pydantic |
| **AI / LLM Engine** | Ollama (Local LLM inference), Custom Local Heuristic Rubric Fallback |
| **Sandbox / RCE** | Python `subprocess`, `tempfile` isolation, Automated Assertion Runner |
| **DevOps & DB** | Docker, Docker Compose, Nginx (Reverse Proxy), PostgreSQL 15 |

---

## 📂 Project Architecture

```text
ai-interview-coach/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   └── llm.py               # Ollama LLM provider & JSON parser
│   │   ├── api/
│   │   │   ├── coding.py            # Secure Python RCE sandbox & unit test injector
│   │   │   ├── interview.py         # Session management & adaptive question routing
│   │   │   ├── resume.py            # Resume parsing & RAG extraction
│   │   │   └── roadmap.py           # Personalized study plan generator
│   │   └── main.py                  # FastAPI entry point & CORS configuration
│   ├── Dockerfile                   # Production Gunicorn + Uvicorn image
│   └── requirements.txt             # Python dependencies
├── src/
│   ├── components/
│   │   └── skeletons/               # Shimmer loading states
│   ├── pages/
│   │   ├── CodingRound.tsx          # Split-screen code editor & Big-O results panel
│   │   ├── Dashboard.tsx            # Glassmorphic analytics & quick-action hub
│   │   ├── InterviewSession.tsx     # Multi-modal interview arena + MediaPipe PIP
│   │   └── ...                      # Resume & Roadmap views
│   ├── services/
│   │   ├── api.ts                   # REST API client
│   │   └── evaluation.ts            # Local rubric fallback & metric builders
│   ├── App.tsx                      # Root application state & navigation shell
│   └── index.css                    # Tailwind v4 global theme & custom scrollbars
├── docker-compose.yml               # Full-stack orchestration (Frontend + Backend + DB)
├── Dockerfile                       # Multi-stage Vite build + Nginx server
└── vite.config.ts                   # Vite bundler & proxy rules
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* **Node.js** (v18+ recommended)
* **Python** (v3.10 or v3.11)
* **Ollama** installed and running locally ([Download Ollama](https://ollama.com/))

### 1. Prepare the Local LLM (Ollama)
Open a terminal and pull your preferred coding/reasoning model (e.g., `llama3` or `mistral`):
```bash
ollama run llama3
```
*Ensure Ollama is running in the background on port `11434`.*

### 2. Start the FastAPI Backend
Open a terminal in the project root and set up the Python environment:
```bash
cd backend
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1
# Or on macOS/Linux: source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*The backend API will be live at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).*

### 3. Start the React (Vite) Frontend
Open a **second terminal** in the project root:
```bash
npm install
npm install @mediapipe/tasks-vision
npm run dev
```
*Open your browser and navigate to `http://localhost:5173`.*

---

## 🐳 Production Deployment (Docker)

To spin up the entire stack using **Nginx**, **Gunicorn (4 workers)**, and **PostgreSQL 15**:

```bash
docker-compose up --build -d
```
* **Production Web App:** `http://localhost` (Port 80)
* **FastAPI Backend:** `http://localhost:8000`
* **PostgreSQL Database:** `localhost:5432`

---

## 🔒 Security Notes (Code Sandbox)
The Live Coding Sandbox (`POST /api/coding/execute`) uses isolated temporary files (`tempfile.NamedTemporaryFile`) and enforces a strict `timeout=3` second execution limit via Python's `subprocess.run` to prevent CPU lockups and infinite loops during local evaluation.

---

## 👨‍💻 Author
**Utkarsh Soni**