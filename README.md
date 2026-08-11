# AI Code Reviewer

An AI-powered application that automatically reviews your code, finds bugs, suggests improvements, enforces best practices, and returns a fully corrected version of your code — powered by the Google Gemini API.

The project is split into a **Frontend (Next.js)** and a **Backend (FastAPI)**.

## 🚀 Quick Start

### 1. Backend Setup
The backend is a FastAPI application that connects to MongoDB and the Gemini API.

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Environment Variables:**
Create a `.env` file in the `backend` folder with the following variables:
```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0
```

**Run the Backend:**
```bash
uvicorn main:app --reload --port 8000
```
The API will run at `http://localhost:8000`. You can view the swagger docs at `http://localhost:8000/docs`.

---

### 2. Frontend Setup
The frontend is a Next.js (React) application styled with TailwindCSS.

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables (optional, defaults to localhost:8000)
# Create frontend/.env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the frontend
npm run dev
```
The app will run at `http://localhost:3000`.

## 🛠️ Tech Stack
- **Frontend**: Next.js 16, React, TailwindCSS, Monaco Editor, Lucide Icons
- **Backend**: Python, FastAPI, Motor (Async MongoDB), Google GenAI SDK (Gemini 2.5 Flash)
- **Database**: MongoDB

## ✨ Features
- **Multi-language Editor**: Write or paste code in 12+ programming languages.
- **Deep AI Analysis**: Detects off-by-one errors, assignment inside conditionals, hardcoded secrets, unused variables, and bad practices.
- **Auto-Fix**: Automatically generates the fully corrected version of the code with a 1-click copy button.
- **Review History**: Saves all previous code reviews to MongoDB so you can revisit them later. Delete them when you are done.
