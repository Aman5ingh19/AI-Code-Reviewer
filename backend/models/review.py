from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AIFeedback(BaseModel):
    bugs: list[str] = []
    suggestions: list[str] = []
    best_practices: list[str] = []
    complexity_summary: str = ""
    fixed_code: str = ""


class ReviewRequest(BaseModel):
    language: str
    source_code: str


class ReviewResponse(BaseModel):
    id: str
    language: str
    source_code: str
    ai_feedback: AIFeedback
    created_at: datetime


class ReviewSummary(BaseModel):
    id: str
    language: str
    created_at: datetime
