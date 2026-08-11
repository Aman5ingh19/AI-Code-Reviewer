const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AIFeedback {
  bugs: string[];
  suggestions: string[];
  best_practices: string[];
  complexity_summary: string;
  fixed_code: string;
}

export interface Review {
  id: string;
  language: string;
  source_code: string;
  ai_feedback: AIFeedback;
  created_at: string;
}

export interface ReviewSummary {
  id: string;
  language: string;
  created_at: string;
}

export async function submitReview(
  language: string,
  source_code: string
): Promise<Review> {
  const res = await fetch(`${API_URL}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, source_code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to submit review");
  }
  return res.json();
}

export async function fetchReviews(): Promise<ReviewSummary[]> {
  const res = await fetch(`${API_URL}/reviews`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function fetchReview(id: string): Promise<Review> {
  const res = await fetch(`${API_URL}/reviews/${id}`);
  if (!res.ok) throw new Error("Review not found");
  return res.json();
}

export async function deleteReview(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/reviews/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete review");
}
