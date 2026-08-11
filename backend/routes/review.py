from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from db.mongo import get_reviews_collection
from models.review import ReviewRequest, ReviewResponse, ReviewSummary, AIFeedback
from services.gemini import analyze_code

router = APIRouter()


def _doc_to_summary(doc: dict) -> ReviewSummary:
    return ReviewSummary(
        id=str(doc["_id"]),
        language=doc["language"],
        created_at=doc["created_at"],
    )


def _doc_to_response(doc: dict) -> ReviewResponse:
    feedback = doc.get("ai_feedback", {})
    return ReviewResponse(
        id=str(doc["_id"]),
        language=doc["language"],
        source_code=doc["source_code"],
        ai_feedback=AIFeedback(
            bugs=feedback.get("bugs", []),
            suggestions=feedback.get("suggestions", []),
            best_practices=feedback.get("best_practices", []),
            complexity_summary=feedback.get("complexity_summary", ""),
            fixed_code=feedback.get("fixed_code", ""),
        ),
        created_at=doc["created_at"],
    )


@router.post("/review", response_model=ReviewResponse, status_code=201)
async def create_review(request: ReviewRequest):
    """Submit code for AI review, save to DB, return full review."""
    collection = get_reviews_collection()

    # Call Gemini AI
    ai_feedback = await analyze_code(request.language, request.source_code)

    # Build document
    doc = {
        "language": request.language,
        "source_code": request.source_code,
        "ai_feedback": ai_feedback.model_dump(),
        "created_at": datetime.now(timezone.utc),
    }

    result = await collection.insert_one(doc)
    doc["_id"] = result.inserted_id

    return _doc_to_response(doc)


@router.get("/reviews", response_model=list[ReviewSummary])
async def list_reviews():
    """Return all reviews as summaries (id, language, created_at)."""
    collection = get_reviews_collection()
    cursor = collection.find({}, {"language": 1, "created_at": 1}).sort("created_at", -1)
    docs = await cursor.to_list(length=200)
    return [_doc_to_summary(doc) for doc in docs]


@router.get("/reviews/{review_id}", response_model=ReviewResponse)
async def get_review(review_id: str):
    """Return full review detail by ID."""
    collection = get_reviews_collection()
    try:
        oid = ObjectId(review_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid review ID format")

    doc = await collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Review not found")

    return _doc_to_response(doc)


@router.delete("/reviews/{review_id}", status_code=204)
async def delete_review(review_id: str):
    """Delete a review by ID."""
    collection = get_reviews_collection()
    try:
        oid = ObjectId(review_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid review ID format")

    result = await collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")

