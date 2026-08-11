"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchReview, Review } from "@/lib/api";
import {
  Bug,
  Lightbulb,
  BookOpen,
  BarChart3,
  ArrowLeft,
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Wand2,
  Copy,
  Check,
} from "lucide-react";

type TabKey = "bugs" | "suggestions" | "best_practices" | "summary" | "fixed_code";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "bugs", label: "Bugs", icon: Bug },
  { key: "suggestions", label: "Suggestions", icon: Lightbulb },
  { key: "best_practices", label: "Best Practices", icon: BookOpen },
  { key: "summary", label: "Summary", icon: BarChart3 },
  { key: "fixed_code", label: "Fixed Code", icon: Wand2 },
];

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
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <CheckCircle2 size={36} className="text-green-500 mb-3" />
      <p className="text-white font-medium">No {label} found</p>
      <p className="text-[#64748b] text-sm mt-1">Great news — your code looks clean here!</p>
    </div>
  );
}

function ListItem({ text, type }: { text: string; type: TabKey }) {
  const icons = {
    bugs: <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />,
    suggestions: <Lightbulb size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />,
    best_practices: <BookOpen size={14} className="text-green-400 flex-shrink-0 mt-0.5" />,
    summary: <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />,
    fixed_code: <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />,
  };
  const borderColors = {
    bugs: "#dc262622",
    suggestions: "#d9770622",
    best_practices: "#16a34a22",
    summary: "#1d4ed822",
    fixed_code: "#1d4ed822",
  };

  return (
    <div
      className="flex gap-3 p-4 rounded-xl mb-3 text-sm leading-relaxed"
      style={{
        background: borderColors[type],
        border: `1px solid ${borderColors[type]}`,
      }}
    >
      {icons[type]}
      <span className="text-[#e2e8f0]">{text}</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        background: copied ? "#16a34a22" : "#ffffff10",
        border: `1px solid ${copied ? "#16a34a44" : "#ffffff18"}`,
        color: copied ? "#86efac" : "#94a3b8",
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy code"}
    </button>
  );
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("bugs");

  useEffect(() => {
    if (!id) return;
    fetchReview(id)
      .then(setReview)
      .catch(() => setError("Could not load this review."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="h-6 w-24 rounded bg-white/10 pulse mb-6" />
        <div className="h-10 w-64 rounded-lg bg-white/10 pulse mb-4" />
        <div className="card p-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 rounded bg-white/10 pulse mb-3" style={{ width: `${70 + i * 7}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 text-center">
        <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
        <p className="text-white font-semibold mb-2">Review not found</p>
        <p className="text-[#64748b] text-sm mb-6">{error}</p>
        <button className="btn-secondary" onClick={() => router.push("/history")}>
          Back to History
        </button>
      </div>
    );
  }

  const { ai_feedback } = review;
  const tabs = {
    bugs: ai_feedback.bugs,
    suggestions: ai_feedback.suggestions,
    best_practices: ai_feedback.best_practices,
  };
  const totalIssues = ai_feedback.bugs.length + ai_feedback.suggestions.length + ai_feedback.best_practices.length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 fade-in">
      {/* Back button */}
      <button
        className="flex items-center gap-2 text-[#64748b] hover:text-white text-sm transition-colors mb-6"
        onClick={() => router.push("/history")}
      >
        <ArrowLeft size={14} />
        All Reviews
      </button>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed22, #4f46e522)", border: "1px solid #7c3aed44" }}
            >
              <FileCode2 size={24} className="text-[#a78bfa]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge ${getBadgeClass(review.language)}`}>
                  {review.language}
                </span>
                <span className="text-[#64748b] text-xs">
                  {totalIssues} item{totalIssues !== 1 ? "s" : ""} found
                </span>
              </div>
              <h1 className="text-xl font-bold text-white">Code Review</h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#64748b] text-sm">
            <Clock size={13} />
            {formatDate(review.created_at)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count =
            key === "summary" || key === "fixed_code"
              ? undefined
              : (tabs[key as keyof typeof tabs] as string[]).length;
          const isFixedCode = key === "fixed_code";
          return (
            <button
              key={key}
              id={`tab-${key}`}
              className={`tab flex items-center gap-2`}
              style={
                activeTab === key
                  ? isFixedCode
                    ? { background: "#16a34a22", borderColor: "#16a34a55", color: "#86efac" }
                    : { background: "#7c3aed22", borderColor: "#7c3aed55", color: "#a78bfa" }
                  : {}
              }
              onClick={() => setActiveTab(key)}
            >
              <Icon size={14} />
              {label}
              {count !== undefined && (
                <span
                  className="px-1.5 py-0.5 rounded-md text-xs font-bold"
                  style={{ background: activeTab === key ? "#7c3aed44" : "#ffffff15" }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="card p-6 fade-in" key={activeTab}>
        {activeTab === "summary" ? (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-[#93c5fd]" />
              Complexity Analysis
            </h2>
            {ai_feedback.complexity_summary ? (
              <p className="text-[#cbd5e1] leading-relaxed text-sm">
                {ai_feedback.complexity_summary}
              </p>
            ) : (
              <p className="text-[#64748b] text-sm">No complexity summary available.</p>
            )}
          </div>
        ) : activeTab === "fixed_code" ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Wand2 size={18} className="text-green-400" />
                Fixed Code
              </h2>
              {ai_feedback.fixed_code && (
                <CopyButton text={ai_feedback.fixed_code} />
              )}
            </div>
            {ai_feedback.fixed_code ? (
              <div>
                <p className="text-[#64748b] text-xs mb-3">
                  All bugs from the review have been automatically corrected below:
                </p>
                <pre
                  className="p-5 rounded-xl text-sm text-[#e2e8f0] overflow-auto"
                  style={{
                    background: "#0d0d14",
                    border: "1px solid #16a34a33",
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    lineHeight: "1.7",
                    maxHeight: "520px",
                  }}
                >
                  {ai_feedback.fixed_code}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 size={36} className="text-green-500 mb-3" />
                <p className="text-white font-medium">No fixes needed</p>
                <p className="text-[#64748b] text-sm mt-1">Your code had no bugs to fix!</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              {activeTab === "bugs" && <Bug size={18} className="text-red-400" />}
              {activeTab === "suggestions" && <Lightbulb size={18} className="text-yellow-400" />}
              {activeTab === "best_practices" && <BookOpen size={18} className="text-green-400" />}
              {TABS.find((t) => t.key === activeTab)?.label}
            </h2>
            {tabs[activeTab as keyof typeof tabs].length === 0 ? (
              <EmptyState label={activeTab.replace("_", " ")} />
            ) : (
              (tabs[activeTab as keyof typeof tabs] as string[]).map((item, i) => (
                <ListItem key={i} text={item} type={activeTab} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Source code (collapsed) */}
      <details className="mt-6">
        <summary
          className="cursor-pointer text-sm text-[#64748b] hover:text-white transition-colors flex items-center gap-2 select-none"
        >
          <FileCode2 size={14} />
          View original code
        </summary>
        <pre
          className="mt-3 p-4 rounded-xl text-xs text-[#94a3b8] overflow-auto max-h-80"
          style={{ background: "#0d0d14", border: "1px solid #ffffff10" }}
        >
          {review.source_code}
        </pre>
      </details>
    </div>
  );
}
