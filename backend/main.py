from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db.mongo import connect_db, close_db
from routes.review import router as review_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="AI Code Reviewer API",
    description="Backend for AI-powered code review using Gemini",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Next.js dev server and production Vercel URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(review_router, tags=["Reviews"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "AI Code Reviewer API"}
