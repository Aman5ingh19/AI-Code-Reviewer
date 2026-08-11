"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { submitReview } from "@/lib/api";
import {
  Code2,
  ChevronDown,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "#0d0d14" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="spinner" />
        <p className="text-[#64748b] text-sm">Loading editor...</p>
      </div>
    </div>
  ),
});

const LANGUAGES = [
  { value: "javascript", label: "JavaScript", monacoLang: "javascript" },
  { value: "typescript", label: "TypeScript", monacoLang: "typescript" },
  { value: "python", label: "Python", monacoLang: "python" },
  { value: "java", label: "Java", monacoLang: "java" },
  { value: "c++", label: "C++", monacoLang: "cpp" },
  { value: "go", label: "Go", monacoLang: "go" },
  { value: "rust", label: "Rust", monacoLang: "rust" },
  { value: "c#", label: "C#", monacoLang: "csharp" },
  { value: "php", label: "PHP", monacoLang: "php" },
  { value: "ruby", label: "Ruby", monacoLang: "ruby" },
  { value: "swift", label: "Swift", monacoLang: "swift" },
  { value: "kotlin", label: "Kotlin", monacoLang: "kotlin" },
];

const SAMPLE_CODES: Record<string, string> = {
  python: `def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

# This could be optimized
result = fibonacci(10)
print(result)`,
  javascript: `function fetchUserData(userId) {
  fetch('/api/users/' + userId)
    .then(res => res.json())
    .then(data => {
      console.log(data)
      document.getElementById('name').innerHTML = data.name
    })
}

fetchUserData(123)`,
};

export default function EditorPage() {
  const router = useRouter();
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(SAMPLE_CODES["javascript"] || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLanguageChange = (lang: (typeof LANGUAGES)[0]) => {
    setLanguage(lang);
    setCode(SAMPLE_CODES[lang.value] || "// Start coding here...\n");
    setDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Please enter some code to review.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const review = await submitReview(language.value, code);
      router.push(`/review/${review.id}`);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3 gap-4 flex-shrink-0"
        style={{
          background: "#12121a",
          borderBottom: "1px solid #ffffff12",
        }}
      >
        <div className="flex items-center gap-3">
          <Code2 size={18} className="text-[#a78bfa]" />
          <h1 className="font-semibold text-white">Code Editor</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="relative">
            <button
              id="language-selector"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: "#1a1a28",
                border: "1px solid #ffffff20",
                color: "#e2e8f0",
              }}
              onClick={() => setDropdownOpen((o) => !o)}
            >
              {language.label}
              <ChevronDown size={14} className="text-[#64748b]" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute top-full mt-1 right-0 z-50 rounded-xl overflow-hidden py-1 min-w-[160px]"
                style={{
                  background: "#1a1a28",
                  border: "1px solid #ffffff18",
                  boxShadow: "0 16px 40px #00000060",
                }}
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5"
                    style={{
                      color:
                        lang.value === language.value ? "#a78bfa" : "#94a3b8",
                    }}
                    onClick={() => handleLanguageChange(lang)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            id="submit-review"
            className="btn-primary flex items-center gap-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 14, height: 14 }} />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Review Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="flex items-center gap-2 px-6 py-3 text-sm text-red-400 flex-shrink-0"
          style={{ background: "#dc262610", borderBottom: "1px solid #dc262630" }}
        >
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language={language.monacoLang}
          value={code}
          onChange={(val) => setCode(val || "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            lineNumbersMinChars: 3,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            renderLineHighlight: "all",
          }}
        />
      </div>

      {/* Loading overlay */}
      {loading && (
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4"
          style={{
            background: "rgba(10,10,15,0.85)",
            backdropFilter: "blur(8px)",
            top: 64,
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c3aed22, #4f46e522)", border: "1px solid #7c3aed44" }}
          >
            <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">Analyzing your code...</p>
            <p className="text-[#64748b] text-sm mt-1">Gemini is reviewing for bugs, suggestions & best practices</p>
          </div>
        </div>
      )}
    </div>
  );
}
