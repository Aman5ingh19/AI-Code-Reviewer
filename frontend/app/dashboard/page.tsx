"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchReviews, ReviewSummary } from "@/lib/api";
import {
  LayoutDashboard,
  PlusCircle,
  Clock,
  FileCode2,
  TrendingUp,
  ChevronRight,
  Zap,
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

export default function DashboardPage() {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews()
      .then(setReviews)
      .catch(() => setError("Could not load reviews. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const mostRecent = reviews[0];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 fade-in">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-[#94a3b8] text-sm mb-2">
          <LayoutDashboard size={14} />
          <span>Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-1">
          Welcome back 👋
        </h1>
        <p className="text-[#64748b]">
          Your AI-powered code reviews at a glance.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-6 p-4 rounded-xl text-sm text-red-400"
          style={{ background: "#dc262612", border: "1px solid #dc262644" }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Total reviews */}
        <div className="card p-6 flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#7c3aed22" }}
          >
            <FileCode2 size={20} className="text-[#a78bfa]" />
          </div>
          <div>
            <p className="text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1">
              Total Reviews
            </p>
            {loading ? (
              <div className="h-7 w-12 rounded bg-white/10 pulse" />
            ) : (
              <p className="text-3xl font-bold text-white">{reviews.length}</p>
            )}
          </div>
        </div>

        {/* Languages */}
        <div className="card p-6 flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#1d4ed822" }}
          >
            <TrendingUp size={20} className="text-[#93c5fd]" />
          </div>
          <div>
            <p className="text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1">
              Languages Used
            </p>
            {loading ? (
              <div className="h-7 w-12 rounded bg-white/10 pulse" />
            ) : (
              <p className="text-3xl font-bold text-white">
                {new Set(reviews.map((r) => r.language)).size}
              </p>
            )}
          </div>
        </div>

        {/* Latest */}
        <div className="card p-6 flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#d9770622" }}
          >
            <Clock size={20} className="text-[#fcd34d]" />
          </div>
          <div>
            <p className="text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1">
              Last Reviewed
            </p>
            {loading ? (
              <div className="h-7 w-32 rounded bg-white/10 pulse" />
            ) : mostRecent ? (
              <p className="text-sm font-semibold text-white">
                {formatDate(mostRecent.created_at)}
              </p>
            ) : (
              <p className="text-sm text-[#64748b]">No reviews yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Most recent review */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap size={16} className="text-[#a78bfa]" /> Most Recent Review
        </h2>
        {loading ? (
          <div className="card p-6">
            <div className="h-5 w-40 rounded bg-white/10 pulse mb-3" />
            <div className="h-4 w-24 rounded bg-white/10 pulse" />
          </div>
        ) : mostRecent ? (
          <Link href={`/review/${mostRecent.id}`}>
            <div className="card p-6 flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#7c3aed22" }}
                >
                  <FileCode2 size={20} className="text-[#a78bfa]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`badge ${getBadgeClass(mostRecent.language)}`}
                    >
                      {mostRecent.language}
                    </span>
                  </div>
                  <p className="text-[#64748b] text-sm">
                    {formatDate(mostRecent.created_at)}
                  </p>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-[#64748b] group-hover:text-[#a78bfa] transition-colors"
              />
            </div>
          </Link>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-[#64748b] mb-4">No reviews yet. Start your first one!</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: "linear-gradient(135deg, #7c3aed18, #4f46e518)",
          border: "1px solid #7c3aed33",
        }}
      >
        <h3 className="text-xl font-bold text-white mb-2">
          Ready to review some code?
        </h3>
        <p className="text-[#94a3b8] text-sm mb-6">
          Paste your code and get instant AI feedback on bugs, suggestions, and best practices.
        </p>
        <Link href="/editor">
          <button className="btn-primary flex items-center gap-2 mx-auto">
            <PlusCircle size={16} />
            Start New Review
          </button>
        </Link>
      </div>
    </div>
  );
}
