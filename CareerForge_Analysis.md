# CareerForge — Complete Analysis & Star-Worthiness Upgrade Plan

> A multi-agent AI career OS that deploys a LangGraph supervisor-worker swarm — adversarial GitHub auditor, Piston-sandboxed broken-code challenges, Groq/Gemini dual-model interview engine, and a live-job-search campaign — to replace unverifiable resume claims with a cryptographically-consistent Skill Passport.

**Analyzed:** 2026-04-26
**Completion:** 82% — Core multi-agent system is real and working; two CI jobs are broken (fixable in < 30 min), several frontend pages hardcode localhost, one critical bug in shadow_auditor.py, and no benchmark numbers yet.
**Verdict:** WORKING BUT ROUGH

---

## 1. What this project is

### Purpose
CareerForge attacks the "AI-slop resume" problem: candidates increasingly use AI to fake portfolios, pass take-home tests, and pad GitHub profiles. The platform fights back with a pipeline of adversarial agents — a GitHub entropy auditor, a code sandbox that generates *deliberately broken* code the candidate must fix, and a LangGraph multi-agent interview graph where a shadow Gemini model silently critiques answers before the lead Llama interviewer responds. Results aggregate into a signed Skill Passport that recruiters can interrogate via a digital-twin chatbot.

### Who it's for
Software engineers actively job-hunting who want verified proof of skill, and recruiters who want a signal beyond keyword-matched resumes.

### What makes it interesting
- **Adversarial verification rather than evaluation** — the "Cursed Sandbox" generates code that *looks* correct but has a subtle bug; you can't delegate fixing it to an AI without understanding the problem.
- **Shadow Auditor architecture** — two competing LLMs (Llama 3.3 + Gemini 2.0 Flash) run in parallel per turn; critique from the auditor is injected into the next interviewer prompt as a "whisper in the ear."
- **Full free-tier stack** — Groq (free inference), Gemini Flash (free tier), Piston (open-source sandbox), Supabase (free PostgreSQL) means anyone can run a full production deployment at $0.

### Current state in one paragraph
The backend is genuinely working — all 5 engines are implemented end-to-end with proper structured outputs, error handling, logging, and a stateful LangGraph graph. The main failure points are in CI (pytest not in requirements.txt, and a known Ubuntu 24 `libasound2` renaming that breaks the Playwright install) rather than in the application logic. The frontend is functional but has scattered hardcoded `localhost:8000` URLs in place of the `NEXT_PUBLIC_API_BASE` env variable. One critical Python bug exists in `shadow_auditor.py` (`_get_llm.invoke` missing `()`), meaning the shadow auditor silently fails on every real request. The Skill Passport is impressively designed but the verification hash is internally computed and not externally provable — the README now correctly discloses this, which is honest but limits the "cryptographic credential" pitch. To get from here to star-worthy takes roughly one focused day.

---

## 2. Repository structure

```
CareerForge/
├── .github/
│   └── workflows/
│       ├── ci.yml                   ✅ Backend test + frontend build pipeline
│       └── e2e.yml                  🔶 Playwright E2E — BROKEN (libasound2 issue on Ubuntu 24)
├── .gitignore                       ✅ Present
├── .pre-commit-config.yaml          ✅ ruff + prettier + pre-commit hooks
├── CONTRIBUTING.md                  ✅ Detailed agent-adding guide
├── CareerForge_Analysis.md          ❌ Internal dev note committed to repo — should be deleted
├── LICENSE                          ✅ MIT
├── Readme.md                        ✅ Excellent — badges, mermaid arch, sample outputs
├── docker-compose.yml               ✅ Two-service compose for backend + frontend
├── track.txt                        ❌ Internal scratch note committed to repo — should be deleted
│
├── backend/
│   ├── main.py                      ✅ 18+ FastAPI routes, auth, CORS, sanitization
│   ├── graph.py                     ✅ LangGraph stateful workflow with MemorySaver
│   ├── agent_state.py               ✅ InterviewState TypedDict with all counters
│   ├── interviewer.py               ✅ Lead Interviewer node (Llama 3.3)
│   ├── shadow_auditor.py            🔶 CRITICAL BUG: _get_llm.invoke should be _get_llm().invoke
│   ├── burnout_guard.py             ✅ Failure counter + intervention router
│   ├── red_team.py                  ✅ Over-engineering / buzzword detector node
│   ├── auditor.py                   ✅ GitHub trust scorer + deep repo context
│   ├── challenge_generator.py       ✅ Structured output CursedChallenge via Groq
│   ├── code_sandbox.py              ✅ Piston API execution + LangGraph node
│   ├── resume_parser.py             ✅ Two-pass OCR + pypdf + LLM analysis
│   ├── resume_tailor.py             ✅ JD-targeted structured rewrite
│   ├── roadmap_generator.py         ✅ Structured CareerRoadmap output
│   ├── demand_analyzer.py           ✅ DuckDuckGo search + LLM synthesis
│   ├── skill_passport.py            ✅ Passport aggregation (fixed session_id bug)
│   ├── negotiator.py                ✅ HR simulation + tactic critique
│   ├── networking_agent.py          ✅ Proof-based cold outreach generator
│   ├── ab_tester.py                 ✅ Dual-variant resume A/B structured output
│   ├── kanban.py                    🔶 Column names mismatch with Supabase schema
│   ├── job_fetcher.py               ✅ DuckDuckGo hunt + gap-aware scoring
│   ├── recruiter_proxy.py           ✅ Digital twin LLM with passport evidence
│   ├── background_worker.py         ✅ APScheduler-based autonomous hunt cycle
│   ├── voice_processor.py           ✅ Groq Whisper + text-based confidence scoring
│   ├── database.py                  ✅ Supabase singleton with stateless fallback
│   ├── logger.py                    ✅ Shared structured logger
│   ├── public_routes.py             ✅ Public profile + digital twin routes (fixed)
│   ├── rate_limiter.py              🔶 Implemented but NOT wired into main.py routes
│   ├── railway.toml                 ✅ Railway deployment config
│   ├── Dockerfile                   ✅ python:3.11-slim with tesseract + poppler
│   ├── requirements.txt             🔶 Missing pytest, stray ddgs duplicate entry
│   ├── supabase_schema.sql          🔶 Column names differ from kanban.py Application model
│   ├── .env.example                 ✅ All variables documented with sources
│   └── tests/
│       ├── verify_fix.py            ✅ Unit test for auditor offline resilience
│       ├── test_flow.py             ✅ Integration tests (fixed route/field bugs)
│       ├── test_gemini.py           ✅ Gemini connectivity diagnostic
│       └── model.py                 ✅ Available Gemini models lister
│
├── frontend/
│   ├── Dockerfile                   ✅ node:20-slim with build args
│   ├── package.json                 ✅ Next.js 16, React 19, Framer Motion, Supabase
│   ├── vercel.json                  ✅ Vercel deployment config
│   ├── src/
│   │   ├── lib/api.ts               ✅ Typed API client with Supabase auth headers
│   │   ├── components/Navbar.tsx    ✅ Responsive nav with live readiness score
│   │   └── app/
│   │       ├── page.tsx             ✅ Auth redirect handler
│   │       ├── layout.tsx           ✅ Root layout + fonts + SEO metadata
│   │       ├── login/page.tsx       ✅ Cyberpunk terminal-style auth UI
│   │       ├── dashboard/page.tsx   ✅ Command center with agent status cards
│   │       ├── interview/page.tsx   ✅ Voice + text interview with MediaRecorder
│   │       ├── resume/page.tsx      🔶 Hardcodes localhost instead of NEXT_PUBLIC_API_BASE
│   │       ├── challenge/page.tsx   🔶 Hardcodes localhost
│   │       ├── roadmap/page.tsx     ✅ Uses NEXT_PUBLIC_API_BASE correctly
│   │       ├── kanban/page.tsx      🔶 Hardcodes localhost, uses "Bearer dev-token"
│   │       ├── hunter/page.tsx      🔶 Hardcodes localhost
│   │       ├── negotiator/page.tsx  🔶 Hardcodes localhost
│   │       ├── outreach/page.tsx    🔶 Hardcodes localhost
│   │       ├── passport/page.tsx    ✅ Uses NEXT_PUBLIC_API_BASE correctly
│   │       ├── recruiter/page.tsx   ✅ Uses API properly (internal fetch)
│   │       ├── experiments/page.tsx 🔶 Hardcodes 127.0.0.1:8000
│   │       └── candidate/[username]/page.tsx  (public profile — not sampled)
│
└── e2e/
    ├── playwright.config.ts         ✅ Chromium + mobile projects, retry logic
    ├── tests/careerforge.spec.ts    ✅ 25+ tests covering all pages + feature flows
    └── test-results/.last-run.json  ✅ Last run: passed (run against live site)
```

---

## 3. Completion status

**Overall: 82% complete**

| Component | File(s) | Status | What's done | What's missing |
|-----------|---------|--------|-------------|----------------|
| LangGraph Interview Graph | `graph.py`, `agent_state.py` | ✅ Done | Full stateful graph with MemorySaver, 5 nodes, conditional edges | Replace MemorySaver with SqliteSaver for persistence across restarts |
| Lead Interviewer Node | `interviewer.py` | ✅ Done | Dynamic prompt injection from shadow critique, burnout detection | — |
| Shadow Auditor Node | `shadow_auditor.py` | 🔶 Bug | Gemini LLM initialized, prompt designed | `_get_llm.invoke()` missing `()` — always errors silently |
| Red Team Node | `red_team.py` | ✅ Done | Over-engineering + buzzword detection via Llama | — |
| Burnout Guard | `burnout_guard.py` | ✅ Done | Failure counter, intervention injection, track_failure node | — |
| GitHub Auditor | `auditor.py` | ✅ Done | Trust score, deep repo context, graceful offline mode | Commit diff-entropy analysis (in roadmap, not implemented) |
| Challenge Generator | `challenge_generator.py` | ✅ Done | Structured CursedChallenge with test cases | — |
| Code Sandbox | `code_sandbox.py` | ✅ Done | Piston API execution, LangGraph node, multi-language support | — |
| Resume Parser | `resume_parser.py` | ✅ Done | Two-pass OCR + pypdf, LLM analysis, consistent dict return | — |
| Resume Tailor | `resume_tailor.py` | ✅ Done | Structured TailoredResume output, reuses OCR | — |
| A/B Tester | `ab_tester.py` | ✅ Done | Dual variant generation + recommendation | — |
| Roadmap Generator | `roadmap_generator.py` | ✅ Done | Structured WeeklyMilestone output | — |
| Demand Analyzer | `demand_analyzer.py` | ✅ Done | DuckDuckGo live search + LLM synthesis | Hardcoded "2024 2025" date in queries |
| Skill Passport | `skill_passport.py` | ✅ Done | Aggregation, weighted score, DB upsert (fixed session_id bug) | Hash is internal only, not cryptographic proof |
| Negotiator | `negotiator.py` | ✅ Done | HR simulation, tactic critique, offer progression | — |
| Networking Agent | `networking_agent.py` | ✅ Done | Proof-based cold email with passport data | `verified_skills` key doesn't exist on passport — falls back silently |
| Job Fetcher | `job_fetcher.py` | ✅ Done | Gap-aware scoring, DuckDuckGo scrape | Not a real job API — search engine results only |
| Recruiter Proxy | `recruiter_proxy.py` | ✅ Done | Digital twin with passport + interview log evidence | — |
| Kanban | `kanban.py` | 🔶 Partial | CRUD, rejection analysis, APScheduler-based worker | Schema mismatch: model has `role`/`company`, DB has `role_title`/`company_name` |
| Background Worker | `background_worker.py` | ✅ Done | APScheduler hourly hunt + 6h passport refresh | Needs standalone deployment docs |
| Database | `database.py` | ✅ Done | Supabase singleton, stateless fallback, interaction logging | — |
| Rate Limiter | `rate_limiter.py` | 🔶 Partial | Sliding window limiter implemented | Not applied to any route in main.py |
| Voice Processor | `voice_processor.py` | ✅ Done | Groq Whisper transcription, filler word confidence scoring | Audio-feature analysis (librosa) in roadmap only |
| Public Routes | `public_routes.py` | ✅ Done | Real passport + real digital twin (fixed hardcoded mock) | — |
| Frontend — all 13 pages | `frontend/src/app/**` | 🔶 Partial | All pages render, full UI for every feature | 7/13 pages hardcode localhost instead of env var |
| CI — Backend | `.github/workflows/ci.yml` | 🔶 Broken | Structure correct | pytest not in requirements.txt |
| CI — E2E | `.github/workflows/e2e.yml` | 🔶 Broken | Full Playwright suite written | Ubuntu 24 libasound2 rename breaks Playwright install |
| Tests | `backend/tests/` | 🔶 Partial | Unit test for auditor, integration tests for 6 routes | No test for shadow_auditor bug, kanban schema, or LangGraph graph |
| Supabase Schema | `supabase_schema.sql` | 🔶 Partial | RLS, triggers, all tables | Column mismatch with kanban.py model |

---

## 4. Deep code analysis

### What is fully working

- **`GitHubAuditor.calculate_trust_score()`** in `auditor.py`
  - Does: HTTP GET to GitHub API, age/push/repo scoring, graceful `ConnectionError` handling
  - Quality: Good — `_safe_get` wrapper, correct timeout, offline mode returns safe dict

- **`app_graph` (LangGraph workflow)** in `graph.py`
  - Does: Full stateful interview graph with MemorySaver checkpointing; supervisor routes shadow_auditor → red_team (conditional) → lead_interviewer → END, with code_sandbox → track_failure → burnout router cycle
  - Quality: Good — conditional edges correctly wired, `should_run_red_team` skips red team when critique is empty (prevents unnecessary LLM call)

- **`generate_challenge()`** in `challenge_generator.py`
  - Does: Structured `CursedChallenge` output with test cases via `llm.with_structured_output()`
  - Quality: Good — fallback challenge on LLM failure prevents 500 errors in demo

- **`DatabaseManager`** in `database.py`
  - Does: Supabase connection with placeholder-detection (won't connect to `your-project.supabase.co`), stateless fallback, `log_interaction` with user_id linkage
  - Quality: Good — the placeholder detection guard is a clever touch

- **`VoiceProcessor.process_audio()`** in `voice_processor.py`
  - Does: Groq Whisper transcription with technical term hinting, text-based confidence scoring via filler/hedge word counts
  - Quality: Good — fallback returns typed error dict rather than raising

- **`get_skill_passport()`** in `skill_passport.py`
  - Does: Aggregates GitHub trust, challenge pass count, interview sessions into weighted readiness score; persists to DB
  - Quality: Good — fixed `session_id` vs `user_id` bug, weighted formula is documented inline

### What is partially implemented

#### Shadow Auditor — `backend/shadow_auditor.py` line 37

- **What exists:** Full LLM initialization, correct system prompt, proper state handling
- **What's broken:** `response = _get_llm.invoke(...)` — `_get_llm` is a function reference, not a callable result. The `()` is missing, so Python raises `AttributeError: function object has no attribute 'invoke'`, caught by the bare `except Exception`, returning `"Auditor Silent (API Error)"` on every single call
- **What's missing:** The fix is one character
- **Exact fix:**
```python
# Line 37 in shadow_auditor.py — CURRENT (broken):
response = _get_llm.invoke([SystemMessage(content=system_prompt)])

# FIXED:
response = _get_llm().invoke([SystemMessage(content=system_prompt)])
```
- **Estimated effort:** 30 seconds

#### Kanban Schema Mismatch — `backend/kanban.py` vs `backend/supabase_schema.sql`

- **What exists:** `Application` Pydantic model and full CRUD
- **What's broken:** `Application` has fields `company: str` and `role: str`, but the Supabase schema defines `company_name` and `role_title`. Any `INSERT` will hit a column-not-found error in Supabase
- **What's missing:** Either rename the model fields or the schema columns to match
- **Exact fix:** In `kanban.py`, rename the model fields:
```python
class Application(BaseModel):
    company_name: str   # was: company
    role_title: str     # was: role
    status: str = "applied"
    job_url: Optional[str] = None
    notes: Optional[str] = None
```
  Then update all frontend references in `kanban/page.tsx` from `role_title` / `company_name` accordingly.
- **Estimated effort:** 20 minutes

#### Rate Limiter Not Applied — `backend/rate_limiter.py`

- **What exists:** Complete sliding-window `RateLimiter` class with pre-configured `public_limiter` and `llm_limiter` instances and FastAPI dependency functions
- **What's broken:** Not imported or applied anywhere in `main.py`. The unauthenticated `/api/audit/{username}` endpoint can be hammered freely to exhaust the GitHub token quota
- **Exact fix:** In `main.py`:
```python
# Add import at top
from rate_limiter import public_rate_limit, llm_rate_limit
from fastapi import Request

# Add dependency to the audit route:
@app.get("/api/audit/{username}")
async def audit_user_endpoint(username: str, _: None = Depends(public_rate_limit), request: Request = None):

# Add to challenge route:
@app.post("/api/challenge/new")
async def create_challenge(request: ChallengeRequest, user_id: str = Depends(get_current_user), _: None = Depends(llm_rate_limit)):
```
- **Estimated effort:** 15 minutes

#### Frontend Hardcoded URLs — Multiple pages

- **Affected files:** `resume/page.tsx`, `challenge/page.tsx`, `kanban/page.tsx`, `hunter/page.tsx`, `negotiator/page.tsx`, `outreach/page.tsx`, `experiments/page.tsx`
- **What's broken:** All use `http://localhost:8000/api` or `http://127.0.0.1:8000/api` literally. The production deployment at Render/Railway is unreachable from these pages
- **Exact fix:** Replace all occurrences with:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";
// Then use `${API_BASE}/route` everywhere
```
- **Estimated effort:** 30 minutes across all files

#### Networking Agent `verified_skills` Key — `backend/networking_agent.py` line 23

- **What exists:** Passport fetch, fallback logic
- **What's broken:** `passport.get("verified_skills", [])` — this key doesn't exist in the passport dict (which has `skill_verdict`, `readiness_score`, `trust_score` etc). Always returns `[]`, silently falling back to the generic proof statement
- **Exact fix:**
```python
# Replace:
top_skills = passport.get("verified_skills", [])[:3]
# With:
trust_score = passport.get("trust_score", 0)
challenges = passport.get("challenges_passed", 0)
```
- **Estimated effort:** 10 minutes

### What is completely missing

#### pytest in requirements.txt
- **Why it's needed:** CI backend job fails with `No module named pytest`
- **Where it should live:** `backend/requirements.txt`
- **What to add:** `pytest>=8.0.0`
- **Estimated effort:** 1 minute

#### Benchmark / confusion matrix results
- **Why it's needed:** The README roadmap promises "run auditor against 50 AI-slop accounts vs 50 genuine contributors; publish confusion matrix" — this is the single most star-worthy addition possible; it validates the core premise of the project
- **Where it should live:** `backend/benchmarks/audit_eval.py` + a `results/` folder with the output CSV and a notebook
- **Estimated effort:** 2–3 days (data collection + analysis)

#### Demo GIF / video
- **Why it's needed:** The README explicitly has a commented-out `![CareerForge Demo](assets/demo.gif)` placeholder. Without it the project makes strong claims with zero visual proof
- **Where it should live:** `assets/demo.gif`
- **Estimated effort:** 1–2 hours (record + compress with `ffmpeg`)

### Bugs and crashes

| Location | Issue | Fix |
|----------|-------|-----|
| `shadow_auditor.py:37` | `_get_llm.invoke` — missing `()`. Raises `AttributeError` caught silently, shadow critique is always "Auditor Silent" | Change to `_get_llm().invoke(...)` |
| `kanban.py:Application` model | Fields `role`/`company` don't match Supabase schema `role_title`/`company_name` — all INSERTs fail | Rename model fields to match schema |
| `kanban/page.tsx` | Sends `Authorization: Bearer dev-token` as a literal string — will fail against real Supabase auth | Use `getAuthHeaders()` from `api.ts` |
| `requirements.txt` | `pytest` missing — CI backend test step always fails | Add `pytest>=8.0.0` |
| `requirements.txt` | `ddgs>=0.5.0` appears as a stray duplicate at the bottom (duckduckgo-search already listed above) | Remove the duplicate line |
| `e2e.yml` | `npx playwright install --with-deps chromium` fails on Ubuntu 24 because `libasound2` was renamed to `libasound2t64` | Add apt install step before Playwright install (see Phase 1) |
| `demand_analyzer.py:43` | Search queries hardcode "2024 2025" — will produce stale results in 2026+ | Use `datetime.now().year` dynamically |
| `background_worker.py` | `fetch_jobs(role)` return type is `JobHuntReport` dict (not a list) but code does `len(jobs) if isinstance(jobs, list)` — total_found always 0 | Check for `jobs.get("opportunities", [])` instead |
| `CareerForge_Analysis.md` | Internal dev scratch file committed to repo root | Delete from repo |
| `track.txt` | Internal scratch note committed to repo | Delete from repo |

### Code quality issues

- **Mixed logging discipline** in several files: `voice_processor.py`, `challenge_generator.py`, `roadmap_generator.py`, `demand_analyzer.py`, `resume_tailor.py`, `job_fetcher.py` still use `print()` despite `logger.py` existing. Inconsistent log levels make production debugging harder.
- **LLM instances created at module import time** in `challenge_generator.py`, `roadmap_generator.py`, `demand_analyzer.py`, `resume_tailor.py`, `ab_tester.py`, `negotiator.py`, `networking_agent.py` — these all instantiate `ChatGroq(...)` at the top of the module, meaning if `GROQ_API_KEY` is not set when the module loads, every import fails. The lazy-init `_get_llm()` pattern in `interviewer.py` is the correct approach and should be applied everywhere.
- **Temp file cleanup not in finally** in `main.py` resume endpoints: `os.remove(file_location)` is only called on the happy path. If the LLM call raises an exception, the temp file is never deleted. Should be wrapped in `try/finally`.
- **`supabase_schema.sql` applications table** uses `role_title` and `company_name` but the Kanban API model uses `role` and `company`. This inconsistency would only be caught at runtime when Supabase rejects the insert.
- **No input length validation on LLM payloads**: `job_description` in the tailor and A/B endpoints is passed directly to the LLM with no length cap. A 500KB JD will inflate token cost significantly.

---

## 5. Roadmap to star-worthy

### Phase 1 — Fix the two broken CI jobs (do in the next 15 minutes)

1. **Add pytest to requirements.txt**
   - File: `backend/requirements.txt`
   - Action: Add one line
   - What to write: `pytest>=8.0.0` — add after `apscheduler>=3.10.0` and remove the stray `ddgs>=0.5.0` duplicate at the bottom
   - Why: CI backend job fails immediately with `No module named pytest`

2. **Fix the Playwright Ubuntu 24 libasound2 issue**
   - File: `.github/workflows/e2e.yml`
   - Action: Add one step before "Install Playwright browsers"
   - What to write:
   ```yaml
   - name: Fix libasound2 on Ubuntu 24
     run: sudo apt-get update && sudo apt-get install -y libasound2t64
   ```
   - Why: Ubuntu 24 (noble) renamed `libasound2` to `libasound2t64`. Playwright's `--with-deps` tries to install the old name and exits code 100.

3. **Fix the shadow auditor typo**
   - File: `backend/shadow_auditor.py`, line 37
   - Action: Add two characters
   - What to write: Change `_get_llm.invoke(` to `_get_llm().invoke(`
   - Why: The shadow auditor is the architectural differentiator of this project and it has never worked in production due to this bug

4. **Fix Kanban model/schema mismatch**
   - File: `backend/kanban.py`
   - Action: Edit `Application` model field names
   - What to write:
   ```python
   class Application(BaseModel):
       company_name: str
       role_title: str
       status: str = "applied"
       job_url: Optional[str] = None
       notes: Optional[str] = None
   ```
   - Why: Every kanban INSERT will fail against a real Supabase instance

5. **Fix all hardcoded frontend URLs**
   - Files: `resume/page.tsx`, `challenge/page.tsx`, `kanban/page.tsx`, `hunter/page.tsx`, `negotiator/page.tsx`, `outreach/page.tsx`, `experiments/page.tsx`
   - Action: Replace all instances of `http://localhost:8000/api` and `http://127.0.0.1:8000/api` with the pattern already used in `roadmap/page.tsx`:
   ```typescript
   const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";
   ```
   - Why: The production site (`careerforge-zbdw.onrender.com`) cannot reach localhost from the browser. These pages are broken in production.

6. **Fix kanban page auth header**
   - File: `frontend/src/app/kanban/page.tsx`
   - Action: Replace `"Authorization": "Bearer dev-token"` with a real auth call
   - What to write: Import and use `getAuthHeaders()` from `@/lib/api` (already exported there)
   - Why: Sends a literal string "dev-token" as Bearer token — will 401 against real Supabase auth

7. **Delete committed dev files**
   - Files: `CareerForge_Analysis.md`, `track.txt`
   - Action: `git rm CareerForge_Analysis.md track.txt && git commit -m "chore: remove internal dev scratch files"`
   - Why: Internal notes in a public repo look unprofessional

### Phase 2 — Make it impressive

1. **Apply rate limiter to routes**
   - File: `backend/main.py`
   - What to add: Import `public_rate_limit`, `llm_rate_limit` from `rate_limiter.py` and add `Depends(public_rate_limit)` to `/api/audit/{username}` and `/api/audit/deep/{username}`, and `Depends(llm_rate_limit)` to `/api/challenge/new` and `/api/career/roadmap`
   - Impact: Prevents API abuse, protects GitHub token quota

2. **Migrate all module-level LLM init to lazy `_get_llm()` pattern**
   - Files: `challenge_generator.py`, `roadmap_generator.py`, `demand_analyzer.py`, `resume_tailor.py`, `ab_tester.py`, `negotiator.py`, `networking_agent.py`
   - What to change: Move `llm = ChatGroq(...)` inside a `_get_llm()` function following the exact pattern in `interviewer.py`
   - Impact: App no longer crashes at import time if API keys are missing; enables future key rotation

3. **Fix temp file cleanup in resume endpoints**
   - File: `backend/main.py`, functions `upload_resume`, `tailor_resume_endpoint`, `run_resume_ab_test`
   - What to add: Wrap the `analyze_resume()` / `tailor_resume()` / `run_ab_test()` calls in `try/finally` and move the `os.remove()` into the `finally` block
   - Impact: No temp file leaks on LLM failures

4. **Replace MemorySaver with SqliteSaver**
   - File: `backend/graph.py`
   - What to change:
   ```python
   # Replace:
   from langgraph.checkpoint.memory import MemorySaver
   memory = MemorySaver()
   # With:
   from langgraph.checkpoint.sqlite import SqliteSaver
   memory = SqliteSaver.from_conn_string("checkpoints.db")
   ```
   - Impact: Interview session state survives server restarts — critical for the "stateful" claim in the product description

5. **Fix demand_analyzer.py hardcoded year**
   - File: `backend/demand_analyzer.py`, line 43
   - What to change:
   ```python
   from datetime import datetime
   current_year = datetime.now().year
   queries = [
       f"{target_role} job market trends {current_year-1} {current_year}",
       ...
   ]
   ```
   - Impact: Results stop being stale in 2026+

6. **Fix networking_agent.py verified_skills key**
   - File: `backend/networking_agent.py`, lines 22–28
   - What to change: Use actual passport fields instead of a non-existent `verified_skills` key (see exact fix in Section 4)
   - Impact: Cold outreach emails include real trust score data instead of always using the generic fallback

7. **Replace remaining `print()` calls with logger**
   - Files: `voice_processor.py`, `challenge_generator.py`, `roadmap_generator.py`, `demand_analyzer.py`, `resume_tailor.py`, `job_fetcher.py`, `negotiator.py`
   - What to change: Add `from logger import get_logger; logger = get_logger(__name__)` at top of each file, then replace every `print(...)` with `logger.info(...)` or `logger.error(...)`
   - Impact: Consistent log format in production, easier Railway/Render log tailing

### Phase 3 — Make it star-worthy

1. **Record and embed the demo GIF**
   - What to do: Record a 60-second screen recording: upload resume → see GitHub audit score → generate challenge → fix broken code → view Skill Passport. Compress with `ffmpeg -i screen.mp4 -vf fps=10,scale=1200:-1 demo.gif`
   - Where: `assets/demo.gif`, then uncomment the `![CareerForge Demo](assets/demo.gif)` line in Readme.md
   - Why it matters: The README comments literally say "INSERT DEMO GIF HERE" — it's the single highest-leverage addition for strangers deciding whether to star

2. **Run the benchmark and publish results**
   - What to do: Create `backend/benchmarks/audit_eval.py` — collect 50 accounts each of known AI-generated commit spam (low entropy, bulk pushes) vs genuine contributors. Run `calculate_trust_score()` on each, compute precision/recall, output a markdown confusion matrix
   - Where: `results/audit_benchmark.md`
   - Why it matters: This is the empirical validation the project needs. Currently makes strong claims with zero numbers. Adding a confusion matrix makes this research-adjacent and citable.

3. **Add a `/api/stats` public endpoint**
   - What to do: Add an unauthenticated endpoint that returns `{"total_audits": N, "passports_issued": N, "challenges_generated": N}` from Supabase COUNT queries
   - Where: Add to `main.py`, add live counter cards to the landing page
   - Why it matters: Social proof. "4,827 candidates audited" is more compelling than an architecture diagram.

4. **Deploy a live demo account**
   - What to do: Create a demo GitHub user with a real Skill Passport. Link to `careerforge-zbdw.onrender.com/candidate/demo-user` from the README
   - Why it matters: A working link in the README is worth 10 code quality fixes for star conversion

5. **Add a model card**
   - What to do: Create `MODEL_CARD.md` documenting the trust score algorithm, known biases (new accounts get penalized, low push frequency ≠ low skill), and the scoring formula
   - Why it matters: The trust score affects real people's job prospects. Documenting the algorithm's limitations shows intellectual honesty and makes the project more trustworthy to serious readers.

---

## 6. Files to create from scratch

### `backend/benchmarks/audit_eval.py`
**Purpose:** Evaluates the GitHub Auditor's accuracy against a labeled dataset of genuine vs AI-slop accounts

```python
"""
Evaluates GitHubAuditor against labeled accounts.
Run: python benchmarks/audit_eval.py
Outputs: results/audit_benchmark.md with confusion matrix and precision/recall
"""
import json
import os
from pathlib import Path
from auditor import GitHubAuditor

# ── Configuration ─────────────────────────────────────────────────────────────
THRESHOLD = 50  # trust_score >= 50 → predicted genuine

# Labeled dataset: (github_username, true_label)
# "genuine" = real developer; "slop" = AI-generated commits or astroturf
GENUINE_ACCOUNTS = [
    "torvalds", "gvanrossum", "antirez", "mitchellh", "jbrockmeier",
    # ... add 45 more genuine accounts
]

SLOP_ACCOUNTS = [
    # Add 50 known AI-slop/astroturf accounts here
    # Example sources: GitHub repos with 100% AI commit messages, 
    # accounts created to farm Stars
]


def evaluate():
    auditor = GitHubAuditor()
    results = []

    for username in GENUINE_ACCOUNTS:
        score_data = auditor.calculate_trust_score(username)
        predicted = "genuine" if score_data.get("trust_score", 0) >= THRESHOLD else "slop"
        results.append({"username": username, "true": "genuine", "predicted": predicted, "score": score_data.get("trust_score", 0)})

    for username in SLOP_ACCOUNTS:
        score_data = auditor.calculate_trust_score(username)
        predicted = "genuine" if score_data.get("trust_score", 0) >= THRESHOLD else "slop"
        results.append({"username": username, "true": "slop", "predicted": predicted, "score": score_data.get("trust_score", 0)})

    # Compute confusion matrix
    tp = sum(1 for r in results if r["true"] == "genuine" and r["predicted"] == "genuine")
    fp = sum(1 for r in results if r["true"] == "slop" and r["predicted"] == "genuine")
    fn = sum(1 for r in results if r["true"] == "genuine" and r["predicted"] == "slop")
    tn = sum(1 for r in results if r["true"] == "slop" and r["predicted"] == "slop")

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    # Write results
    Path("results").mkdir(exist_ok=True)
    with open("results/audit_benchmark.md", "w") as f:
        f.write(f"# GitHub Auditor Benchmark Results\n\n")
        f.write(f"Threshold: trust_score >= {THRESHOLD} → predicted genuine\n\n")
        f.write(f"| Metric | Value |\n|--------|-------|\n")
        f.write(f"| Precision | {precision:.2f} |\n")
        f.write(f"| Recall    | {recall:.2f} |\n")
        f.write(f"| F1        | {f1:.2f} |\n")
        f.write(f"| True Positives | {tp} |\n")
        f.write(f"| False Positives | {fp} |\n")
        f.write(f"| True Negatives | {tn} |\n")
        f.write(f"| False Negatives | {fn} |\n")

    print(f"Results written to results/audit_benchmark.md")
    print(f"Precision: {precision:.2f}, Recall: {recall:.2f}, F1: {f1:.2f}")


if __name__ == "__main__":
    evaluate()
```

---

## 7. Files to modify

### `backend/requirements.txt`
| Location | Change type | What to do |
|----------|-------------|------------|
| After `apscheduler>=3.10.0` | Add | `pytest>=8.0.0` |
| Last line `ddgs>=0.5.0` | Delete | Remove duplicate — duckduckgo-search is already listed above |

### `backend/shadow_auditor.py`
| Location | Change type | What to do |
|----------|-------------|------------|
| Line 37 | Fix critical bug | Change `_get_llm.invoke(` to `_get_llm().invoke(` |

### `.github/workflows/e2e.yml`
| Location | Change type | What to do |
|----------|-------------|------------|
| Before "Install Playwright browsers" step | Add step | `- name: Fix libasound2 on Ubuntu 24` / `  run: sudo apt-get update && sudo apt-get install -y libasound2t64` |

### `backend/kanban.py`
| Location | Change type | What to do |
|----------|-------------|------------|
| `Application` model | Rename fields | `company` → `company_name`, `role` → `role_title` to match Supabase schema |

### `frontend/src/app/resume/page.tsx` (and kanban, challenge, hunter, negotiator, outreach, experiments)
| Location | Change type | What to do |
|----------|-------------|------------|
| All `fetch("http://localhost:8000/api/...` | Replace | `const API_BASE = process.env.NEXT_PUBLIC_API_BASE \|\| "http://localhost:8000/api";` and use template literal |
| `kanban/page.tsx` auth header | Replace | Use `getAuthHeaders()` from `@/lib/api` instead of literal `"Bearer dev-token"` |

### `backend/demand_analyzer.py`
| Location | Change type | What to do |
|----------|-------------|------------|
| Line 43 | Dynamic year | Add `from datetime import datetime` and replace "2024 2025" with `f"{datetime.now().year-1} {datetime.now().year}"` |

### `backend/networking_agent.py`
| Location | Change type | What to do |
|----------|-------------|------------|
| Lines 22–25 | Fix key name | Replace `passport.get("verified_skills", [])[:3]` — use `passport.get("trust_score", 0)` and `passport.get("challenges_passed", 0)` instead |

---

## 8. README rewrite blueprint

The current README is already excellent — it has badges, a Mermaid architecture diagram, sample JSON outputs, a clear quick-start, and an honest roadmap. Do not rewrite it. Make these targeted additions only.

### Sections the README must add

1. **Demo GIF** — Uncomment the `![CareerForge Demo](assets/demo.gif)` placeholder once the GIF is recorded. Place it immediately after the one-line description, before the badge row.

2. **Live Demo link** — Add `[**🚀 Live Demo**](https://careerforge-zbdw.onrender.com)` to the navigation row at the top alongside "Setup Guide" and "Architecture"

3. **Benchmark results** — Once `results/audit_benchmark.md` is generated, add a "📊 Benchmark" section near the top with the F1 table. Even rough numbers (e.g., F1=0.78 on 100 accounts) dramatically increase credibility.

4. **"How the Shadow Auditor works" deep-dive** — Add a 4-sentence explanation of the dual-LLM architecture under Engine 3. The Llama + Gemini collaboration is the most novel technical choice in the project and it's currently only visible in the Mermaid diagram.

### Suggested demo / visual
Record this exact sequence:
1. Upload a sample PDF resume (use a real one with redacted PII)
2. Show the parsed `skills_detected` JSON
3. Click "GitHub Audit" on a username — watch the trust score render
4. Click "New Challenge" — show the broken code appear
5. Fix the bug in the editor — click Verify — see `ALL_TESTS_PASSED`
6. Navigate to Skill Passport — show the readiness score increment

Command to compress: `ffmpeg -i screen_recording.mp4 -vf "fps=12,scale=1200:-1:flags=lanczos" -loop 0 assets/demo.gif`

### Badges already present (all correct, keep them)
```markdown
[![Build Status](https://github.com/Mannava-Daasaradhi/CareerForge/actions/workflows/ci.yml/badge.svg?branch=main)]
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB)]
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000)]
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)]
[![LangGraph](https://img.shields.io/badge/LangGraph-Stateful_Agents-FF6B00)]
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]
```

Add one more badge:
```markdown
[![E2E Tests](https://github.com/Mannava-Daasaradhi/CareerForge/actions/workflows/e2e.yml/badge.svg)](https://github.com/Mannava-Daasaradhi/CareerForge/actions/workflows/e2e.yml)
```

---

## 9. Tech stack

| Layer | Current | Recommended change | Reason |
|-------|---------|--------------------|--------|
| Python | 3.11 | Keep | Good — 3.11 is the LTS sweet spot |
| LangGraph | `>=0.2.0` (unpinned minor) | Pin to `>=0.2.0,<0.3.0` | LangGraph has breaking changes between minor versions |
| LLM inference | Groq (Llama 3.3 70B) + Gemini 2.0 Flash | Keep | Excellent free-tier cost profile |
| Graph checkpoint | MemorySaver (in-process) | SqliteSaver | Survives restarts; critical for stateful claim |
| Frontend | Next.js 16 + React 19 | Keep | Cutting edge — shows awareness of latest releases |
| Auth | Supabase Auth | Keep | Free tier, RLS policies already written |
| Code sandbox | Piston public API | Keep for dev; consider self-hosted for prod | Public Piston has rate limits; self-hosted is free and unlimited |
| Web search | DuckDuckGo via `langchain_community` | Keep | Zero cost, sufficient for demo |
| Background jobs | APScheduler | Keep for single-server; add Railway cron for multi-instance | Good enough for v1 |
| Containerization | Dockerfile + docker-compose | Keep | Already present |
| CI/CD | GitHub Actions (ci.yml + e2e.yml) | Fix two failures (see Phase 1), then keep | Good structure |
| Dependency management | `requirements.txt` (unpinned `>=`) | Consider `pip-compile` for lockfile | `>=` ranges can cause subtle prod/dev differences |
| Pre-commit | ruff + prettier | Keep | Excellent choice |

---

## 10. Dependencies audit

### Current dependencies — notable issues

| Package | Issue |
|---------|-------|
| `langgraph>=0.2.0` | Unpinned minor — breaking changes possible |
| `langchain>=0.3.0` | Same — pin to `>=0.3.0,<0.4.0` |
| `ddgs>=0.5.0` | **Duplicate** — already have `duckduckgo-search>=6.3.0` above it. Remove |
| `pytest` | **Missing** — CI fails without it |
| `apscheduler>=3.10.0` | Good — present |
| `numpy>=2.0.0`, `pandas>=2.2.0` | Present but unused in any backend module — remove to reduce install size |

### Missing dependencies
| Import | Used in | Missing from requirements |
|--------|---------|--------------------------|
| `pytest` | `tests/verify_fix.py` | Not listed anywhere |

### Recommended final requirements.txt
```
# Core Orchestration
langgraph>=0.2.0,<0.3.0
langchain>=0.3.0,<0.4.0
langchain-core>=0.3.0,<0.4.0
langchain-groq>=0.2.0
langchain-google-genai>=2.0.0
langchain-community>=0.3.0

# AI Inference Clients
groq>=0.12.0
google-generativeai>=0.8.0

# API & Server
fastapi>=0.115.0
uvicorn[standard]>=0.32.0
python-dotenv>=1.0.0
requests>=2.32.0
pydantic>=2.9.0

# Database
supabase>=2.9.0

# Security & PII Redaction
presidio-analyzer>=2.2.355
presidio-anonymizer>=2.2.355

# Document Processing
pdf2image>=1.17.0
pytesseract>=0.3.10
pypdf>=4.0.0

# Web Search
duckduckgo-search>=6.3.0

# Background Worker Scheduler
apscheduler>=3.10.0

# Utilities
python-multipart>=0.0.9

# Testing
pytest>=8.0.0
```
(Remove `numpy`, `pandas`, `ddgs` — all unused or duplicate)

---

## 11. Setup and run (once complete)

```bash
# Clone
git clone https://github.com/Mannava-Daasaradhi/CareerForge
cd CareerForge

# Backend setup
cd backend
cp .env.example .env
# Edit .env — add GROQ_API_KEY and GOOGLE_API_KEY (both free tier)

python -m venv venv
source venv/bin/activate          # Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# System dependencies (for OCR)
# Ubuntu: sudo apt-get install -y tesseract-ocr poppler-utils
# macOS:  brew install tesseract poppler
# Windows: winget install UB-Mannheim.TesseractOCR + poppler from GitHub releases

# Run backend
uvicorn main:app --reload --port 8000
# Expected: INFO: Uvicorn running on http://0.0.0.0:8000

# Verify backend
curl http://localhost:8000/
# → {"status":"active","mode":"stateful_agent"}

curl http://localhost:8000/api/audit/torvalds
# → {"username":"torvalds","trust_score":100,...}

# Frontend setup (new terminal)
cd ../frontend
npm install
echo "NEXT_PUBLIC_API_BASE=http://localhost:8000/api" > .env.local
npm run dev
# Expected: ▲ Next.js 16 — Local: http://localhost:3000

# Run tests
cd ../backend
python -m pytest tests/verify_fix.py -v
# Expected: 1 passed

# One-command Docker alternative (from repo root)
docker compose up --build
# Frontend: http://localhost:3000 | Backend: http://localhost:8000
```

---

## 12. Key decisions that need to be made

- **`MemorySaver` vs `SqliteSaver` for the interview graph:** `MemorySaver` is in-process (lost on restart); `SqliteSaver` persists to disk. For a Railway/Render deployment that restarts on every deploy, `MemorySaver` means every candidate loses their session after a deployment. The fix is a one-line change to `graph.py` but requires adding `aiosqlite` to requirements. **Recommendation:** Switch to `SqliteSaver` before going to production.

- **"Cryptographic" Skill Passport:** The README previously called the SHA-256 hash a "cryptographic credential." It's now correctly described as an internal consistency hash. A real cryptographic commitment would require signing with a server private key (Ed25519 or similar) so a recruiter can verify without calling the API. This is a meaningful engineering decision: implement it properly (adds complexity, requires key management) or keep the current honest disclaimer. **Recommendation:** Keep the disclaimer for v1 but add it to the roadmap.

- **Piston API — public vs self-hosted:** The public Piston API (`emkc.org/api/v2/piston`) has undocumented rate limits and no SLA. For a production demo, hitting the rate limit during a recruiter's live demonstration would be catastrophic. **Recommendation:** Add a Docker Compose service for self-hosted Piston in the development `docker-compose.yml` and document it as the default for production.

- **DuckDuckGo search for job fetching:** The job hunter uses a DuckDuckGo search query filtered to `greenhouse.io` and `lever.co` — this is clever but fragile (search results change, site: operator behavior varies). Should this be upgraded to a real job API (Adzuna, JSearch) for the production site? **Recommendation:** Keep DuckDuckGo for v1 (it's a valid "this is a demo/hackathon project" decision) but add a clear `# TODO: replace with real jobs API for production` comment.

- **Background worker deployment:** `background_worker.py` must run as a separate process alongside uvicorn. Railway supports `Procfile` with multiple process types. This is not documented anywhere in the repo. **Recommendation:** Add a `Procfile` and a note in the README.

---

## 13. What would make this genuinely impressive

The architecture is already compelling. What would elevate it from "interesting hackathon project" to "something engineers share on HN" is empirical validation:

**The Benchmark Gap is the Project's Biggest Opportunity.** The core claim — "adversarial AI verification detects fake GitHub profiles" — is unproven. Running the auditor against 100 labeled accounts (50 genuine contributors from active OSS projects, 50 clearly AI-astroturfed accounts with zero-entropy commit messages) and publishing a confusion matrix would be the single most impactful addition. Even if the F1 is modest (say 0.72), an honest evaluation with a methodology is more valuable than a perfect-sounding claim without one.

**Commit Entropy as a Feature.** The roadmap mentions diff-entropy analysis ("character-level entropy of commit diffs") but it's not implemented. This is actually a novel signal that doesn't appear in academic papers on GitHub authenticity detection (most papers use metadata-only features). Implementing it — even a simple Shannon entropy of diffs from the GitHub API — and including it in the trust score formula would make this project genuinely research-adjacent.

**The Shadow Auditor Experiment.** Once the `()` bug is fixed, run an ablation study: compare interview ratings with shadow auditor enabled vs disabled (the critique injection is already A/B-able). If the shadow auditor demonstrably improves follow-up question quality, that's a publishable result for a workshop paper on multi-agent interview systems.

**A real published Skill Passport.** If you (the author) run through the full pipeline with your own GitHub account, generate a real Skill Passport, and link to `careerforge.io/candidate/your-username` from the README and your own GitHub profile, that single link does more for the project's credibility than any code change.

---

## 14. Star-worthiness checklist

### Must-have (project is not shareable without these)
- [x] Runs end-to-end without crashing from a fresh clone
- [x] README explains what the project does in the first paragraph
- [x] Setup is achievable in under 5 commands
- [x] At least one concrete result, output, or demo is shown (sample JSON outputs in README)
- [x] No hardcoded absolute paths, API keys, or secrets in code
- [x] requirements.txt exists — [ ] **NOT pinned to minor versions, missing pytest**
- [x] LICENSE file is present (MIT)

### Should-have (separates good repos from great ones)
- [x] Architecture diagram in README (excellent Mermaid flowchart)
- [ ] Results table with numbers (accuracy, F1) — benchmark not run yet
- [x] At least one working example script (test_flow.py, verify_fix.py)
- [x] Reproducible results (fixed seeds in LLM calls, .env.example)
- [x] Proper logging (logger.py exists) — [ ] not applied to all files
- [x] Meaningful error messages and exception handling
- [ ] Type hints on all public functions — inconsistent across modules
- [x] Docstrings on key public functions
- [x] .gitignore covers generated files

### Nice-to-have (makes it genuinely star-worthy)
- [ ] **Demo GIF in README** — placeholder commented out, recording needed
- [x] Docker / docker-compose for one-command setup
- [x] GitHub Actions CI (two workflows) — [ ] **both currently failing**
- [ ] Comparison to baseline / SOTA benchmark
- [x] CONTRIBUTING.md with detailed agent-adding guide
- [ ] CHANGELOG.md — not present
- [x] Pre-commit hooks (ruff + prettier)
- [ ] Model card documenting trust score algorithm biases
- [ ] Interactive hosted demo link in README
- [ ] Paper or blog post (strong candidate for an AI agents workshop submission)