import os
import json
import re
import asyncio
from google import genai
from google.genai import types
from dotenv import load_dotenv
from models.review import AIFeedback

load_dotenv()

_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

FALLBACK_FEEDBACK = AIFeedback(
    bugs=[],
    suggestions=[],
    best_practices=[],
    complexity_summary="AI review could not be completed. Please try again.",
)

# gemini-2.5-flash is confirmed available on this API key
MODEL_NAME = "gemini-2.5-flash"


def _build_prompt(language: str, source_code: str) -> str:
    return f"""You are a strict, senior code reviewer specializing in {language}.
Your task is to find ALL real bugs, security issues, and bad practices in the code below.

WHAT TO LOOK FOR:

BUGS (add each one to the "bugs" array):
- Off-by-one errors: using <= instead of < in loops (e.g., i <= array.length reads one past the end)
- Assignment in condition: using = instead of == or === (e.g., if (pass = "1234") always evaluates to true)
- Null/undefined access, type errors, wrong comparisons
- Infinite loops, incorrect logic, unreachable code, missing return values

SECURITY (add each one to the "bugs" array - these are bugs too):
- Hardcoded passwords, API keys, secrets, tokens in source code
- SQL injection, unvalidated user input, use of eval()

SUGGESTIONS (add to "suggestions" array):
- Unused variables or parameters
- Redundant or inefficient code
- Missing error handling or input validation

BEST PRACTICES (add to "best_practices" array):
- Using var instead of let/const in JavaScript
- Poor naming, missing documentation, magic numbers

CRITICAL RULES - FOLLOW THESE EXACTLY:
1. The "bugs" array MUST contain every bug you find. Do not leave it empty if bugs exist.
2. if (x = value) is ALWAYS a bug. It assigns instead of comparing. Report it.
3. Any hardcoded secret string (password, key, token) is ALWAYS a bug. Report it.
4. An array loop with i <= array.length is ALWAYS an off-by-one bug. Report it.
5. Be specific: name the function, variable, or line where each issue occurs.
6. In "fixed_code", return the COMPLETE corrected version of the original code with ALL bugs fixed.
   Apply every fix from the bugs list. Preserve the original structure and formatting.
   The fixed_code must be valid, runnable {language} code.

Respond with ONLY this JSON structure (no markdown, no code fences, no extra text):
{{
  "bugs": ["Bug 1 description with fix", "Bug 2 description with fix"],
  "suggestions": ["Suggestion 1"],
  "best_practices": ["Best practice 1"],
  "complexity_summary": "Overall assessment of the code quality and complexity.",
  "fixed_code": "The complete corrected version of the code with all bugs fixed."
}}

Code to review ({language}):
{source_code}"""


def _extract_json(text: str) -> dict | None:
    """Try multiple strategies to extract JSON from model response."""
    # Strategy 1: Direct parse
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Strategy 2: Strip markdown code fences
    try:
        cleaned = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Strategy 3: Find JSON object using regex
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except json.JSONDecodeError:
        pass

    return None


def _parse_response(text: str) -> AIFeedback | None:
    """Try to extract and parse JSON from model response."""
    print(f"\n[DEBUG] Raw Gemini response:\n{text}\n")

    data = _extract_json(text)
    if data is None:
        print("[ERROR] Could not extract JSON from response.")
        return None

    print(f"[DEBUG] Bugs found: {data.get('bugs', [])}")

    return AIFeedback(
        bugs=data.get("bugs", []),
        suggestions=data.get("suggestions", []),
        best_practices=data.get("best_practices", []),
        complexity_summary=data.get("complexity_summary", ""),
        fixed_code=data.get("fixed_code", ""),
    )


async def analyze_code(language: str, source_code: str) -> AIFeedback:
    """Call Gemini API asynchronously and return structured AIFeedback."""
    prompt = _build_prompt(language, source_code)
    loop = asyncio.get_event_loop()

    print(f"\n[INFO] Analyzing {language} code ({len(source_code)} chars) with {MODEL_NAME}...")

    for attempt in range(2):
        try:
            response = await loop.run_in_executor(
                None,
                lambda: _client.models.generate_content(
                    model=MODEL_NAME,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.1,
                        response_mime_type="application/json",
                    ),
                )
            )
            text = response.text
            feedback = _parse_response(text)
            if feedback:
                print(f"[INFO] Found {len(feedback.bugs)} bugs, {len(feedback.suggestions)} suggestions.")
                return feedback
            print(f"[WARN] Attempt {attempt + 1}: Failed to parse response.")
        except Exception as e:
            print(f"[ERROR] Attempt {attempt + 1}: Gemini API error -- {e}")

    return FALLBACK_FEEDBACK
