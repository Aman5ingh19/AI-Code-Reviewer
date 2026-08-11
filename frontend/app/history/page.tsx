"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchReviews, deleteReview, ReviewSummary } from "@/lib/api";
import {
  History,
  FileCode2,
  ChevronRight,
  Search,
  AlertTriangle,
  Plus,
  Clock,
  Trash2,
} from "lucide-react";

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: "badge-yellow",
  typescript: "badge-blue",
  python: "badge-purple",
  java: "badge-red",
  "c++": "badge-blue",
  go: "badge-blue",
  rust: "badge-red",
  default: "badge-purple",
};

function getBadgeClass(lang: string) {
  return LANGUAGE_COLORS[lang.toLowerCase()] || LANGUAGE_COLORS.default;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function HistoryPage() {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews()
      .then(setReviews)
      .catch(() => setError("Could not load review history."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = reviews.filter((r) =>
    r.language.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setConfirmId(null);
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Could not delete review. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#94a3b8] text-sm mb-2">
            <History size={14} />
            <span>Review History</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text">All Reviews</h1>
          <p className="text-[#64748b] text-sm mt-1">
            {loading ? "Loading..." : `${reviews.length} review${reviews.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <Link href="/editor">
          <button className="btn-primary flex items-center gap-2">
            <Plus size={15} />
            New Review
          </button>
        </Link>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
        style={{ background: "#12121a", border: "1px solid #ffffff12" }}
      >
        <Search size={16} className="text-[#64748b]" />
        <input
          id="history-search"
          type="text"
          placeholder="Filter by language..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-[#475569] outline-none w-full"
        />
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2 p-4 rounded-xl text-sm text-red-400 mb-4"
          style={{ background: "#dc262612", border: "1px solid #dc262644" }}
        >
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 pulse" />
              <div className="flex-1">
                <div className="h-4 w-24 rounded bg-white/10 pulse mb-2" />
                <div className="h-3 w-36 rounded bg-white/10 pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          {reviews.length === 0 ? (
            <>
              <FileCode2 size={48} className="text-[#334155] mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No reviews yet</h3>
              <p className="text-[#64748b] text-sm mb-6">
                Submit your first code review to get started.
              </p>
              <Link href="/editor">
                <button className="btn-primary">Start First Review</button>
              </Link>
            </>
          ) : (
            <>
              <Search size={40} className="text-[#334155] mx-auto mb-4" />
              <p className="text-[#64748b]">No reviews match &quot;{search}&quot;</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review, index) => (
            <div
              key={review.id}
              className="card flex items-center gap-4 cursor-pointer group"
              style={{
                animationDelay: `${index * 40}ms`,
                opacity: deletingId === review.id ? 0.4 : 1,
                transition: "opacity 0.3s",
              }}
            >
              {/* Clickable area */}
              <Link
                href={`/review/${review.id}`}
                className="flex items-center gap-4 flex-1 min-w-0 p-5"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#7c3aed18" }}
                >
                  <FileCode2 size={18} className="text-[#a78bfa]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${getBadgeClass(review.language)}`}>
                      {review.language}
                    </span>
                    <span className="text-[#475569] text-xs">
                      {timeAgo(review.created_at)}
                    </span>
                  </div>
                  <p className="text-[#64748b] text-xs flex items-center gap-1">
                    <Clock size={10} />
                    {formatDate(review.created_at)}
                  </p>
                </div>

                <ChevronRight
                  size={16}
                  className="text-[#64748b] group-hover:text-[#a78bfa] transition-colors flex-shrink-0"
                />
              </Link>

              {/* Delete button / Confirm zone */}
              <div className="flex items-center gap-2 pr-4 flex-shrink-0">
                {confirmId === review.id ? (
                  <>
                    <span className="text-xs text-[#94a3b8]">Delete?</span>
                    <button
                      id={`confirm-delete-${review.id}`}
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                      style={{ background: "#dc2626", border: "1px solid #dc262666" }}
                    >
                      {deletingId === review.id ? "Deleting..." : "Yes, delete"}
                    </button>
                    <button
                      id={`cancel-delete-${review.id}`}
                      onClick={() => setConfirmId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#94a3b8] transition-all hover:text-white"
                      style={{ background: "#1a1a28", border: "1px solid #ffffff15" }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    id={`delete-${review.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setConfirmId(review.id);
                    }}
                    className="p-2 rounded-lg text-[#475569] hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete review"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
