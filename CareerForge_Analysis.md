# CareerForge — Complete Analysis & Star-Worthiness Upgrade Plan

> A LangGraph-powered, multi-agent career operating system that deploys five autonomous AI engines — adversarial code sandboxing, voice confidence analysis, GitHub entropy auditing, a real-time salary negotiation dojo, and a Digital Twin chatbot — to verify skills candidates can't fake and mint the proof into a portable Skill Passport recruiters can interrogate.

**Analyzed:** April 22, 2026
**Completion:** ~72% — The backend's 20+ agents are largely real and wired together, but six broken import seams, a never-incrementing burnout counter, three frontend pages on hardcoded mock data, and a missing `frontend/.env.local.example` prevent a clean cold-start run.
**Verdict:** WORKING BUT ROUGH

---

## 1. What this project is

### Purpose
CareerForge addresses the collapse of trust in technical hiring caused by AI-assisted cheating: candidates use ChatGPT to ace take-homes, Copilot to pass live challenges, and AI-generated commit histories to fake GitHub portfolios. The project deploys a swarm of autonomous agents to adversarially verify skills rather than merely evaluate them, then compiles all evidence into a Skill Passport — a portable, hash-consistent credential that replaces unverifiable resume claims. The outcome is a two-sided platform: candidates get an AI career command center, recruiters get a verified signal instead of noise.

### Who it's for
Software engineering candidates (junior to mid-level) who want AI-assisted job hunting, interview prep, and verifiable credentials — and technical recruiters who want a trustworthy alternative to keyword-matched resumes in an AI-saturated applicant pool.

### What makes it interesting

- **LangGraph stateful multi-agent graph with real persistence**: The interview engine uses `MemorySaver` checkpointing so burnout failure counters, Shadow Auditor critique history, and conversation state survive across separate HTTP requests — architecturally more sophisticated than the typical stateless LLM endpoint.
- **Adversarial verification via deliberate sabotage**: The "Cursed Sandbox" generates *intentionally broken* code calibrated to the candidate's claimed skill level, then verifies their fix via the Piston API. A candidate can't pass by copying a correct solution from ChatGPT because the bug is generated fresh each time — this is a genuinely novel approach to defeating AI-faked competence.
- **Zero-cost infrastructure thesis**: The entire AI stack runs on free tiers (Groq for Llama 3.3 inference, Gemini 2.0 Flash as Shadow Auditor, Supabase for PostgreSQL with pgvector) — it's a real, deployable architecture with a credible cost-at-zero pitch.

### Current state in one paragraph
The backend is the strong half of this repo — most of the 20+ Python modules are meaningfully implemented, the LangGraph graph compiles and runs, Groq and Gemini calls are real, the Piston sandbox integration works, and the Supabase schema with RLS policies is production-worthy. However, six critical integration seams are broken: `resume_tailor.py` and `background_worker.py` import `extract_text_with_ocr` and `fetch_jobs` which do not exist in `resume_parser.py` and `job_fetcher.py` respectively — causing immediate `ImportError` on startup; the `burnout_guard.py` router reads `consecutive_failures` but never writes it back, so burnout protection is permanently dormant; `red_team_verdict` is missing from `InterviewState` so the red team node silently discards its output; `public_routes.py` serves hardcoded mock passport data; and three frontend pages (`/passport`, `/dashboard` agent statuses, `/roadmap`) render hardcoded `setTimeout` mock data instead of calling the real API. The frontend itself is visually impressive — a consistent cyberpunk aesthetic with Framer Motion animations — but the missing `frontend/.env.local.example` means frontend setup will fail for any new contributor. None of these require rewriting core logic; every fix is a targeted patch.

---

## 2. Repository structure

```
CareerForge/
├── Readme.md                       ✅ Strong narrative, good architecture diagram, sample outputs
├── CONTRIBUTING.md                 ✅ Excellent — explains how to add agents and LangGraph nodes
├── LICENSE                         ✅ MIT license present
├── .gitignore                      ✅ Covers .env, node_modules, __pycache__, venv
├── .pre-commit-config.yaml         ✅ ruff, prettier, pre-commit-hooks wired up
├── docker-compose.yml              ✅ Backend + frontend services, env_file wired
├── CareerForge_Analysis.md         🔶 Previous (partial) analysis doc — superseded by this one
│
├── .github/
│   └── workflows/
│       └── ci.yml                  ✅ CI: Python tests + Next.js build on push/PR
│
├── backend/
│   ├── main.py                     ✅ FastAPI entrypoint — 18+ routes, auth, CORS, PII redaction
│   ├── graph.py                    ✅ LangGraph stateful workflow — compiles and runs
│   ├── agent_state.py              🔶 Missing `red_team_verdict: Optional[str]` field
│   ├── interviewer.py              ✅ Lead interviewer node (Llama 3.3 via Groq)
│   ├── shadow_auditor.py           ✅ Silent critique node (Gemini 2.0 Flash)
│   ├── burnout_guard.py            🔶 Router logic correct; counter never increments (critical bug)
│   ├── red_team.py                 🔶 Fully written but result field missing from state — output silently lost
│   ├── auditor.py                  ✅ GitHub trust scorer + deep repo context fetcher
│   ├── database.py                 ✅ Supabase singleton with graceful offline/stateless fallback
│   ├── resume_parser.py            ✅ Two-pass OCR + pypdf extraction, always returns dict
│   ├── resume_tailor.py            ❌ Imports `extract_text_with_ocr` which doesn't exist → ImportError on startup
│   ├── voice_processor.py          ✅ Groq Whisper transcription + text confidence metrics
│   ├── challenge_generator.py      ✅ Structured "Cursed Challenge" generation via Groq
│   ├── code_sandbox.py             ✅ Piston API execution + LangGraph node
│   ├── roadmap_generator.py        ✅ Structured weekly roadmap with Pydantic output
│   ├── demand_analyzer.py          ✅ DuckDuckGo + LLM market pulse (imported correctly in main.py)
│   ├── skill_passport.py           ✅ Aggregates trust score + DB results; interview query fixed
│   ├── negotiator.py               ✅ Coach + HR opponent negotiation with structured output
│   ├── networking_agent.py         ✅ Proof-based cold outreach generation
│   ├── ab_tester.py                ✅ Two-variant resume A/B generator
│   ├── kanban.py                   ✅ Full CRUD + rejection analysis; properly wired in main.py
│   ├── job_fetcher.py              ❌ Exports `hunt_opportunities()` but background_worker imports `fetch_jobs()` → ImportError
│   ├── recruiter_proxy.py          ✅ Digital Twin with passport evidence
│   ├── public_routes.py            🔶 Routes wired to real functions (fixed), no longer mock
│   ├── background_worker.py        ❌ Imports `fetch_jobs` (doesn't exist) → crashes on startup
│   ├── logger.py                   ✅ Shared structured logger, replaces print()
│   ├── rate_limiter.py             ✅ In-memory sliding window limiter — written but NOT wired into any route
│   ├── supabase_schema.sql         ✅ Full schema: profiles, interview_logs, applications, challenge_attempts, RLS
│   ├── railway.toml                ✅ Railway deployment config
│   ├── Dockerfile                  ✅ Python 3.11-slim + tesseract + poppler installed
│   ├── .env.example                ✅ All 5 required variables documented with sources
│   ├── requirements.txt            🔶 All deps present and correctly versioned; numpy/pandas unused
│   └── tests/
│       ├── verify_fix.py           ✅ Real unittest — auditor offline resilience (mocked network)
│       ├── test_flow.py            ✅ Integration test suite — 6 routes, fixed to use correct endpoints
│       ├── test_gemini.py          🔶 Smoke test script, not a proper unittest
│       └── model.py                🔶 Dev utility (lists Gemini models), not a test
│
└── frontend/
    ├── package.json                ✅ Pinned deps — Next.js 16, React 19, Framer Motion, Supabase
    ├── next.config.ts              ✅ React Compiler enabled
    ├── tailwind.config.ts          ✅ Standard config
    ├── tsconfig.json               ✅ Standard strict TypeScript config
    ├── eslint.config.mjs           ✅ Standard ESLint config
    ├── vercel.json                 ✅ Vercel deployment config
    ├── Dockerfile                  ✅ Node 20-alpine, multi-stage build
    ├── README.md                   🔶 Default Next.js README — not project-specific
    ├── public/                     🔶 Only default Next.js SVGs — no screenshots/demo assets
    ├── .env.local.example          ❌ MISSING — frontend setup will fail for new contributors
    └── src/
        ├── lib/api.ts              🔶 Complete typed API client; `framer-motion` missing from imports
        ├── components/
        │   └── Navbar.tsx          ✅ Responsive, animated, fetches live readiness score
        └── app/
            ├── layout.tsx          ✅ Root layout, JetBrains Mono + Inter fonts, SEO metadata
            ├── globals.css         ✅ Tailwind base styles
            ├── page.tsx            ✅ Landing page — polished, Framer Motion animations
            ├── login/page.tsx      ✅ Real Supabase auth with cyberpunk UI
            ├── dashboard/page.tsx  🔶 Agent status cards use hardcoded mock array; real passport fetch present
            ├── interview/page.tsx  ✅ Voice recording + text fallback + real backend calls
            ├── resume/page.tsx     ✅ Upload / audit / tailor / A/B tabs with real API
            ├── kanban/page.tsx     ✅ Drag-drop board with rejection modal and real API
            ├── hunter/page.tsx     ✅ Job search with real API call
            ├── challenge/page.tsx  🔶 Field name mismatch vs backend (`description` vs `scenario`)
            ├── roadmap/page.tsx    🔶 Has generateRoadmap() with real API call — needs auth header added
            ├── negotiator/page.tsx ✅ Real API calls to /negotiator/start and /chat
            ├── outreach/page.tsx   ✅ Real API call to /network/generate
            ├── passport/page.tsx   🔶 Entirely hardcoded mock data — getPassport() never called
            ├── recruiter/page.tsx  🔶 Has askDigitalTwin() wired; mock initial data
            ├── experiments/page.tsx 🔶 A/B test page exists; API call needs auth header
            └── candidate/[username]/page.tsx ✅ Public profile page with real fetch
```

---

## 3. Completion status

**Overall: ~72% complete**

| Component | File(s) | Status | What's done | What's missing |
|-----------|---------|--------|-------------|----------------|
| LangGraph interview graph | `graph.py`, `agent_state.py` | 🔶 Partial | Compiles, runs, MemorySaver persistence works | `red_team_verdict` missing from state; burnout counter never written back |
| Lead Interviewer node | `interviewer.py` | ✅ Done | Full Llama 3.3 call, dynamic prompt injection from critique | — |
| Shadow Auditor node | `shadow_auditor.py` | ✅ Done | Gemini 2.0 Flash critique with graceful key-missing fallback | — |
| Burnout Guard | `burnout_guard.py` | 🔶 Broken | Router reads counter; intervention node exists | Counter never incremented — always reads 0, intervention unreachable |
| Red Team node | `red_team.py` | 🔶 Broken | LLM call implemented, wired into graph | `red_team_verdict` field missing from `InterviewState` — output silently lost |
| GitHub Auditor | `auditor.py` | ✅ Done | Trust score + deep repo context, graceful offline | — |
| Code Sandbox | `code_sandbox.py` | ✅ Done | Piston API execution + LangGraph node + multi-language | — |
| Resume Parser | `resume_parser.py` | ✅ Done | Two-pass OCR + pypdf, always returns dict | — |
| Resume Tailor | `resume_tailor.py` | ❌ Broken | Ghostwriter logic correct | Imports `extract_text_with_ocr` which doesn't exist → `ImportError` on server start |
| Voice Processor | `voice_processor.py` | ✅ Done | Groq Whisper, confidence metrics, graceful fallback | — |
| Challenge Generator | `challenge_generator.py` | ✅ Done | Structured output, fallback challenge | — |
| Roadmap Generator | `roadmap_generator.py` | ✅ Done | Pydantic structured weekly plan | — |
| Demand Analyzer | `demand_analyzer.py` | ✅ Done | DuckDuckGo + LLM synthesis, wired to route | — |
| Skill Passport | `skill_passport.py` | ✅ Done | Aggregation fixed, persistence, hash | `challenge_results` table name mismatches schema (`challenge_attempts`) |
| Negotiator | `negotiator.py` | ✅ Done | Coach + HR opponent, structured output | — |
| Networking Agent | `networking_agent.py` | ✅ Done | Proof-based outreach, passport integration | — |
| A/B Tester | `ab_tester.py` | ✅ Done | Two-variant generation, full content output | — |
| Kanban | `kanban.py` | ✅ Done | Full CRUD + rejection analysis, all routes wired | — |
| Job Fetcher | `job_fetcher.py` | 🔶 Broken | `hunt_opportunities()` fully works | Exports wrong name — background worker imports `fetch_jobs` → `ImportError` |
| Background Worker | `background_worker.py` | ❌ Broken | APScheduler wiring, passport refresh logic | Imports `fetch_jobs` (wrong name); separate process, no Procfile/startup hook |
| Recruiter Proxy | `recruiter_proxy.py` | ✅ Done | LLM-powered digital twin with evidence | — |
| Public Routes | `public_routes.py` | ✅ Done | Wired to real skill_passport and recruiter_proxy | — |
| Rate Limiter | `rate_limiter.py` | 🔶 Unused | Fully implemented sliding window | Not wired to any route in main.py |
| Database layer | `database.py` | ✅ Done | Supabase singleton + stateless fallback | — |
| Structured logging | `logger.py` | ✅ Done | Shared logger, used in most modules | Some modules (main.py, voice_processor.py) still use print() |
| Supabase schema | `supabase_schema.sql` | ✅ Done | Full schema with RLS, triggers | `skill_passports` table referenced in code but missing from schema |
| FastAPI entrypoint | `main.py` | ✅ Done | 18+ routes, auth, CORS, PII redaction | Rate limiter not wired; `/api/kanban/add` ignores `user_id` from route |
| Authentication | `main.py` | ✅ Done | Supabase JWT validation, dev fallback | — |
| Frontend API client | `src/lib/api.ts` | 🔶 Partial | Typed client for most routes | Missing `getNegotiatorStart`, `runABTest` typed wrappers |
| Frontend landing page | `src/app/page.tsx` | ✅ Done | Polished bento grid layout | — |
| Frontend login | `src/app/login/page.tsx` | ✅ Done | Real Supabase auth | — |
| Frontend dashboard | `src/app/dashboard/page.tsx` | 🔶 Partial | Passport fetch present | Agent status cards hardcoded |
| Frontend interview | `src/app/interview/page.tsx` | ✅ Done | Voice + text, session persistence | — |
| Frontend resume | `src/app/resume/page.tsx` | ✅ Done | All 4 tabs wired to real API | — |
| Frontend kanban | `src/app/kanban/page.tsx` | ✅ Done | Drag-drop, rejection modal | — |
| Frontend challenge | `src/app/challenge/page.tsx` | 🔶 Broken | UI complete | Field name mismatch: uses `description` but backend returns `scenario` |
| Frontend passport | `src/app/passport/page.tsx` | ❌ Broken | Polished UI with badges | Entirely hardcoded mock data — never calls `getPassport()` |
| Frontend roadmap | `src/app/roadmap/page.tsx` | 🔶 Partial | `generateRoadmap()` calls API | Missing auth header — returns 401 |
| Frontend negotiator | `src/app/negotiator/page.tsx` | ✅ Done | Real API calls | — |
| Frontend outreach | `src/app/outreach/page.tsx` | ✅ Done | Real API call | — |
| CI/CD | `.github/workflows/ci.yml` | ✅ Done | Backend tests + frontend build | Only runs `verify_fix.py`, not `test_flow.py` |
| Docker | `Dockerfile`, `docker-compose.yml` | ✅ Done | Both services, env_file wired | — |
| Pre-commit | `.pre-commit-config.yaml` | ✅ Done | ruff + prettier + hooks | — |
| Tests | `tests/` | 🔶 Partial | verify_fix.py (real unittest), test_flow.py (integration) | No unit tests for core agents; test_gemini.py/model.py not proper tests |
| Frontend env example | `frontend/.env.local.example` | ❌ Missing | — | New contributors can't set up frontend without it |

---

## 4. Deep code analysis

### What is fully working

- **`GitHubAuditor.calculate_trust_score()`** in `auditor.py` (lines 59–85)
  - Does: Fetches user data + events from GitHub API, calculates a 0–100 trust score based on account age (40pts), recent push events (40pts), and public repo count (20pts), returns structured dict with verdict
  - Quality: Good — graceful offline handling via `_safe_get`, optional token for rate limit avoidance

- **`GitHubAuditor.fetch_top_repo_context()`** in `auditor.py` (lines 38–57)
  - Does: Finds user's top-starred repo, fetches README + 2 code files, truncates to 2000 chars each for token safety
  - Quality: Good — sensible extension targeting, star-based ranking

- **`app_graph` (LangGraph)** in `graph.py`
  - Does: Compiles a stateful 5-node workflow (shadow_auditor → red_team/lead_interviewer → code_sandbox → burnout_intervention → lead_interviewer) with `MemorySaver` persistence. Thread-keyed state survives across HTTP calls.
  - Quality: Good architecture — conditional routing, clean node separation

- **`VoiceProcessor.process_audio()`** in `voice_processor.py`
  - Does: Submits audio bytes to Groq Whisper with a technical vocabulary hint, returns transcribed text + confidence/clarity metrics (filler word count, hedge word detection)
  - Quality: Works, graceful error fallback; confidence metric is text-based (legitimate limitation noted in roadmap)

- **`generate_challenge()` / `generate_learning_roadmap()` / `analyze_market_demand()`**
  - All use Groq with `with_structured_output(PydanticModel)` — clean pattern, fallback values on LLM failure, correct structured returns

- **`database.py` — `DatabaseManager`**
  - Does: Creates Supabase client only when real credentials are provided (checks for placeholder strings), falls back to stateless mode silently — this is a great DX pattern
  - Quality: Good — fail-safe, singleton, `log_interaction()` doesn't crash the interview on DB failure

- **`supabase_schema.sql`**
  - Complete: 4 tables, RLS policies on all of them, UUID extension, foreign key cascade on auth.users, automatic profile creation trigger
  - Quality: Production-worthy

- **Frontend pages: interview, resume, kanban, negotiator, outreach, hunter, landing, login**
  - All make real API calls through `api.ts`, handle loading/error states, and have polished UI with Framer Motion animations

### What is partially implemented

#### Burnout Counter — `burnout_guard.py` / `graph.py`
- **What exists:** `burnout_router()` reads `state.get("consecutive_failures", 0)` and routes to `burnout_intervention` if `failures >= 2`. The intervention node exists and resets the counter to 0.
- **What's broken:** The counter is read but never written. When code fails, `burnout_router` returns `"retry_prompt"` but doesn't return `{"consecutive_failures": failures + 1}`. LangGraph nodes that route via conditional edges cannot update state — a separate node must do it.
- **What's missing:** A `track_failure_node` that increments the counter needs to be inserted between `code_sandbox` and `burnout_router`.
- **Exact fix:**
  ```python
  # In burnout_guard.py — add this new node:
  def track_failure_node(state: InterviewState) -> dict:
      """Increments consecutive_failures counter when code fails."""
      output = state.get("code_output", "")
      is_error = "Traceback" in output or "Error:" in output or "FAIL" in output
      if is_error:
          return {"consecutive_failures": state.get("consecutive_failures", 0) + 1}
      return {"consecutive_failures": 0}  # reset on success

  # In graph.py — change the routing:
  # BEFORE: code_sandbox → conditional(burnout_router)
  # AFTER:  code_sandbox → track_failure → conditional(burnout_router)
  workflow.add_node("track_failure", track_failure_node)
  workflow.add_edge("code_sandbox", "track_failure")
  workflow.add_conditional_edges("track_failure", burnout_router, {...})
  ```
- **Estimated effort:** 30 minutes

#### Red Team Verdict State Field — `agent_state.py` / `red_team.py`
- **What exists:** `red_team_node()` returns `{"red_team_verdict": response.content}`. The node is wired in `graph.py` and runs correctly.
- **What's broken:** `InterviewState` TypedDict in `agent_state.py` has no `red_team_verdict` field. LangGraph silently discards state updates for unknown fields.
- **What's missing:** One line in `agent_state.py`.
- **Exact fix:** Add `red_team_verdict: Optional[str]` to `InterviewState`. Then in `interviewer.py`, read it: `red_verdict = state.get("red_team_verdict", "")` and inject it into the base prompt when it starts with `"RED FLAG:"`.
- **Estimated effort:** 20 minutes

#### Skill Passport DB Table Name Mismatch — `skill_passport.py`
- **What exists:** `skill_passport.py` queries `challenge_results` table. The Supabase schema defines `challenge_attempts` table.
- **What's broken:** The query silently returns 0 challenges passed for every user.
- **Exact fix:** In `skill_passport.py` line ~35, change `"challenge_results"` to `"challenge_attempts"`.
- **Estimated effort:** 5 minutes

#### Frontend Challenge Page Field Name — `challenge/page.tsx`
- **What exists:** The challenge UI renders the challenge description.
- **What's broken:** The frontend reads `challenge.description` but the backend `CursedChallenge` Pydantic model returns `challenge.scenario`. The field renders as `undefined`.
- **Exact fix:** In `challenge/page.tsx`, replace all occurrences of `challenge.description` with `challenge.scenario`.
- **Estimated effort:** 10 minutes

#### Frontend Passport Page — `passport/page.tsx`
- **What exists:** A polished badge-display UI with a hardcoded mock candidate.
- **What's broken:** `getPassport()` from `api.ts` is never called. All data comes from `setTimeout(() => setData({...hardcoded...}), 800)`.
- **What's missing:** `useEffect` that calls `getPassport(username)` and maps the real API response (`readiness_score`, `trust_score`, `challenges_passed`, `skill_verdict`, `verification_hash`) to the page's data model.
- **Estimated effort:** 1 hour (needs a real-to-display mapping layer since badge structure doesn't map 1:1 from the current passport API)

#### Frontend Roadmap Page Auth Header — `roadmap/page.tsx`
- **What exists:** `generateRoadmap()` makes a real `fetch()` call to `/api/career/roadmap`.
- **What's broken:** The fetch has no `Authorization` header. The backend route uses `Depends(get_current_user)` which will return 401 for unauthenticated requests.
- **Exact fix:** Import `getAuthHeaders` from `api.ts` and add `headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) }` to the fetch call.
- **Estimated effort:** 15 minutes

### What is completely missing

#### `frontend/.env.local.example`
- **Why it's needed:** Without it, new contributors don't know what environment variables the frontend needs. `npm run dev` silently uses empty strings for Supabase keys and `localhost:8000` for the API base — but there's nothing to copy/fill in.
- **Where it should live:** `frontend/.env.local.example`
- **What it should contain:**
  ```bash
  # Supabase (optional — auth won't work without these)
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

  # Backend URL
  NEXT_PUBLIC_API_BASE=http://localhost:8000/api
  ```
- **Estimated effort:** 5 minutes

#### `skill_passports` table in Supabase schema
- **Why it's needed:** `skill_passport.py` calls `db_manager.supabase.table("skill_passports").upsert(...)`. This table doesn't exist in `supabase_schema.sql`. The upsert fails silently (caught by `except`), but passport data is never persisted.
- **Where it should live:** `backend/supabase_schema.sql`
- **What it should contain:**
  ```sql
  create table public.skill_passports (
    id uuid default uuid_generate_v4() primary key,
    user_id text not null unique,
    readiness_score int,
    trust_score int,
    challenges_passed int,
    interview_sessions int,
    skill_verdict text,
    verification_hash text,
    generated_at timestamptz default now()
  );
  alter table public.skill_passports enable row level security;
  create policy "Public passports are viewable by everyone"
    on public.skill_passports for select using (true);
  create policy "System can upsert passports"
    on public.skill_passports for all using (true);
  ```
- **Estimated effort:** 15 minutes

#### Rate limiter wiring in `main.py`
- **Why it's needed:** `rate_limiter.py` is fully implemented and documented, but no route in `main.py` uses it. The public `/api/audit/{username}` route makes GitHub API calls — without rate limiting it can exhaust the GitHub token quota in minutes.
- **Where it should live:** `backend/main.py` — add `Depends(public_rate_limit)` to `/api/audit/{username}` and `Depends(llm_rate_limit)` to `/api/challenge/new`, `/api/career/roadmap`, `/api/career/demand`.
- **Estimated effort:** 20 minutes

### Bugs and crashes

| Location | Issue | Fix |
|----------|-------|-----|
| `resume_tailor.py:9` | `from resume_parser import extract_text_with_ocr` — function doesn't exist | Change to `from resume_parser import _extract_text as extract_text_with_ocr` or add a public alias `extract_text_with_ocr = _extract_text` to `resume_parser.py` |
| `background_worker.py:30` | `from job_fetcher import fetch_jobs` — function is named `hunt_opportunities` | Change to `from job_fetcher import hunt_opportunities` and update the call on line 51 |
| `burnout_guard.py` | `consecutive_failures` never incremented — burnout protection always dormant | Add `track_failure_node` (see Phase 1 fix above) |
| `agent_state.py` | Missing `red_team_verdict: Optional[str]` field | Add the field; LangGraph silently drops updates to unknown keys |
| `skill_passport.py:~35` | Queries `challenge_results` table; schema defines `challenge_attempts` | Change table name in query |
| `main.py` `/api/kanban/add` route | Calls `db_manager.supabase.table("applications").insert(app_dict)` but doesn't pass `user_id` from the authenticated route | The `kanban.py` `add_application()` function accepts `user_id` correctly; the `main.py` route needs to pass it: `kanban.add_application(app, user_id)` instead of the inline insert |
| `challenge/page.tsx` | Reads `challenge.description` — field is `scenario` in backend model | Replace `description` with `scenario` |
| `passport/page.tsx` | Entirely hardcoded mock data, `getPassport()` never called | Replace `setTimeout` mock with real API call |
| `roadmap/page.tsx` | Missing auth header on fetch — returns 401 | Add `...(await getAuthHeaders())` to fetch headers |
| `supabase_schema.sql` | Missing `skill_passports` table — passport upsert silently fails | Add table definition (see above) |
| `frontend/` | Missing `.env.local.example` | Create the file |

### Code quality issues

- **Mixed print() and logger usage** in `main.py`, `voice_processor.py`, `negotiator.py`: These modules were written before `logger.py` was added and still use `print()`. Not a crash, but inconsistent and invisible in production log aggregators.
- **`numpy` and `pandas` in `requirements.txt`** with no usage in any backend file: These are large dependencies (adds ~200MB to Docker image) that appear to be left from an earlier version. Should be removed.
- **No timeout on `requests.get` in `database.py`**: The Supabase health check has no timeout. On a slow network this could block server startup indefinitely.
- **`verify_challenge` in `main.py` uses `repr()` on test case values**: `safe_input = repr(test['input_val'])` — this works for simple Python types but will produce unparseable output for complex objects or non-Python languages.
- **`recruiter_proxy.py` accesses `passport.get("verified_skills", [])` and `passport.get("github_trust_score", 0)`**: These keys don't exist in `skill_passport.py`'s return dict (actual keys are `trust_score` and there's no `verified_skills` list). The digital twin will always claim zero verified skills.
- **`Navbar.tsx` imports `framer-motion`**: `AnimatePresence` and `motion` are used in `Navbar.tsx` but `framer-motion` is not in `package.json`'s `dependencies`. It works because it's a transitive dependency, but this is fragile.

---

## 5. Roadmap to star-worthy

### Phase 1 — Make it actually run (critical, do first)

1. **Fix `resume_tailor.py` import crash**
   - File: `backend/resume_parser.py`
   - Action: Add one line at the bottom of the file: `extract_text_with_ocr = _extract_text`
   - Why: `resume_tailor.py` and it import this name; without it the FastAPI server crashes on startup before serving any request

2. **Fix `background_worker.py` import crash**
   - File: `backend/background_worker.py`, line 30
   - Action: Change `from job_fetcher import fetch_jobs` → `from job_fetcher import hunt_opportunities as fetch_jobs`
   - Why: Server startup ImportError; background worker is useless until this resolves

3. **Fix burnout counter — add `track_failure_node`**
   - File: `backend/burnout_guard.py` — add the `track_failure_node` function as described in Section 4
   - File: `backend/graph.py` — replace the direct `code_sandbox → burnout_router` edge with `code_sandbox → track_failure → burnout_router`
   - Why: The burnout intervention is the most distinctive feature of the interview engine; it's dead code until this is fixed

4. **Add `red_team_verdict` to InterviewState**
   - File: `backend/agent_state.py`
   - Action: Add `red_team_verdict: Optional[str]` to the `InterviewState` TypedDict
   - File: `backend/interviewer.py` — read `state.get("red_team_verdict", "")` and inject `"RED FLAG:"` verdicts into the interviewer base prompt
   - Why: Red team output is silently discarded without this; it's already wired in the graph

5. **Fix Skill Passport table name**
   - File: `backend/skill_passport.py`, line ~35
   - Action: Change `"challenge_results"` → `"challenge_attempts"`
   - File: `backend/supabase_schema.sql` — add `skill_passports` table definition (see Section 6 below)
   - Why: Challenges passed always reads as 0; passport score is always artificially low

6. **Fix recruiter_proxy key names**
   - File: `backend/recruiter_proxy.py`, lines where `passport.get("verified_skills")` and `passport.get("github_trust_score")` are called
   - Action: Change `"verified_skills"` → `"skill_verdict"` (or build a skills list from audit data); change `"github_trust_score"` → `"trust_score"`
   - Why: Digital Twin always claims zero evidence; defeating the entire point of the feature

7. **Create `frontend/.env.local.example`**
   - File: `frontend/.env.local.example`
   - Action: Create with 3 variables (see Section 6)
   - Why: Every new contributor will fail `npm run dev` without it

8. **Fix frontend challenge page field name**
   - File: `frontend/src/app/challenge/page.tsx`
   - Action: Replace all `challenge.description` with `challenge.scenario`
   - Why: The challenge description renders as `undefined` to every user

9. **Fix frontend passport page — connect to real API**
   - File: `frontend/src/app/passport/page.tsx`
   - Action: Remove the `setTimeout` mock block; add `useEffect` that calls `getPassport(username)` after fetching the username from Supabase session
   - Why: The Skill Passport is the project's core value proposition — it must display real verified data

10. **Fix roadmap page auth header**
    - File: `frontend/src/app/roadmap/page.tsx`, inside `generateRoadmap()`
    - Action: Import `getAuthHeaders` from `@/lib/api`; add `headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) }` to the fetch
    - Why: The route requires auth; without the header every roadmap request returns 401

11. **Wire rate limiter to public routes**
    - File: `backend/main.py`
    - Action: `from rate_limiter import public_rate_limit, llm_rate_limit`; add `_: None = Depends(public_rate_limit)` to `/api/audit/{username}` and `Depends(llm_rate_limit)` to `/api/challenge/new`, `/api/career/roadmap`, `/api/career/demand`
    - Why: The `rate_limiter.py` module exists specifically for this; without wiring, free-tier GitHub token quota can be exhausted by a single script

### Phase 2 — Make it impressive (do second)

1. **Commit entropy analysis in GitHub Auditor**
   - File: `backend/auditor.py`
   - What to add: A `calculate_commit_entropy()` method that fetches recent commit diffs via the GitHub API and computes character-level entropy (Shannon entropy of diff content). Low entropy = repetitive AI-generated patterns.
   - Impact: Makes the "fights AI with AI" claim technically credible, not just marketing

2. **Voice stress analysis via librosa audio features**
   - File: `backend/voice_processor.py`
   - What to add: After Whisper transcription, use `librosa` to analyze the raw audio bytes: extract pitch variance (`librosa.yin`), pause duration histogram, and speech rate. These are real stress signals; current confidence score is text-only.
   - Impact: Differentiates CareerForge's interview engine from any LLM chatbot wrapper

3. **Shareable Skill Passport URL — wire `/candidate/{username}` to real data**
   - File: `frontend/src/app/candidate/[username]/page.tsx`
   - What to add: The route exists and makes a fetch call; verify it calls the public passport endpoint and add a "Copy Link" button + social share meta tags
   - Impact: Candidates can link their Skill Passport from their resume — this is the viral distribution mechanism

4. **SQLite/Postgres persistent checkpointer for LangGraph**
   - File: `backend/graph.py`
   - What to change: Replace `MemorySaver()` with `SqliteSaver.from_conn_string("checkpoints.db")` (or a Supabase-backed checkpointer). `MemorySaver` loses all interview state on server restart.
   - Impact: Interview sessions survive server restarts; essential for production

5. **Remove unused dependencies from requirements.txt**
   - File: `backend/requirements.txt`
   - Action: Remove `numpy>=2.0.0` and `pandas>=2.2.0` — neither is imported anywhere in the backend. Reduces Docker image by ~200MB and pip install time significantly.
   - Impact: Faster CI, faster Docker builds, smaller image

6. **Background worker as a Procfile entry**
   - File: `Procfile` (new file at repo root)
   - What to add: `worker: cd backend && python background_worker.py`
   - Impact: Railway/Heroku can run it as a second dyno; makes the autonomous job-hunt loop actually run in deployment

### Phase 3 — Make it star-worthy (do last)

1. **Record and embed a demo GIF**
   - What to do: Record a 60-second screen capture: upload resume → GitHub audit → generate cursed challenge → fix it → view Skill Passport
   - Where: `assets/demo.gif` — embed at the top of `Readme.md` where the `<!-- INSERT DEMO GIF HERE -->` comment currently sits
   - Why it matters for starworthiness: The README already has this placeholder. Filling it converts a "looks interesting" repo into a "I need to try this" repo in under 10 seconds

2. **Publish GitHub audit benchmark results**
   - What to do: Run `auditor.calculate_trust_score()` against 20 known AI-slop accounts (repos full of GPT-generated code) and 20 genuine contributors; publish a confusion matrix in the README
   - Where: New `## Benchmark` section in `Readme.md`
   - Why it matters for starworthiness: The entire premise of the project rests on the auditor working — showing that it does with real numbers is the difference between a claim and a proof

3. **Add architecture diagram as an image (not Mermaid)**
   - What to do: Export the Mermaid diagram as an SVG/PNG; also create a second simplified "data flow" diagram showing the 5 engines in sequence
   - Where: `assets/architecture.png` embedded in README after the Mermaid block
   - Why it matters for starworthiness: GitHub renders Mermaid but many README viewers/scrapers don't; a static image ensures the architecture is always visible

4. **Interactive demo via Gradio or hosted backend**
   - What to do: Deploy backend to Railway (free tier, `railway.toml` already exists); add the live URL to README badges and Quick Start
   - Where: Update `Readme.md` with `[![Live Demo](badge)](https://your-railway-url)` and "Try it without installing" section
   - Why it matters for starworthiness: Eliminates the friction of "I'd have to set this up to try it"

5. **Add type hints and docstrings to remaining functions**
   - What to do: `main.py` route handlers and `voice_processor.py` methods need return type hints; several `agent_state.py` fields need inline comments explaining their purpose
   - Where: `backend/main.py`, `backend/voice_processor.py`
   - Why it matters for starworthiness: Open source contributors evaluate code quality at a glance; typed, documented code signals a serious project

---

## 6. Files to create from scratch

### `frontend/.env.local.example`
**Purpose:** Tells new contributors what environment variables the frontend needs

```bash
# ─────────────────────────────────────────────────
# CareerForge — Frontend Environment Variables
# Copy this file to .env.local and fill in your keys
# ─────────────────────────────────────────────────

# ── Backend URL ─────────────────────────────────────
# Local development:
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
# Production (Railway, etc.):
# NEXT_PUBLIC_API_BASE=https://your-railway-app.railway.app/api

# ── Supabase (optional — auth won't work without these) ──
# Find at: https://supabase.com/dashboard/project/<project>/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

### `Procfile` (repo root)
**Purpose:** Enables Railway/Heroku to run the background worker as a separate process alongside the web server

```
web: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
worker: cd backend && python background_worker.py
```

---

## 7. Files to modify

### `backend/resume_parser.py`
| Location | Change type | What to do |
|----------|-------------|------------|
| End of file, after all function definitions | Add alias | Add `extract_text_with_ocr = _extract_text` — this is the public name that `resume_tailor.py` and `background_worker.py` import |

### `backend/background_worker.py`
| Location | Change type | What to do |
|----------|-------------|------------|
| Line 30 | Fix import | Change `from job_fetcher import fetch_jobs` → `from job_fetcher import hunt_opportunities as fetch_jobs` |

### `backend/agent_state.py`
| Location | Change type | What to do |
|----------|-------------|------------|
| Inside `InterviewState` TypedDict, after `is_burnout_risk` | Add field | Add `red_team_verdict: Optional[str]` |

### `backend/burnout_guard.py`
| Location | Change type | What to do |
|----------|-------------|------------|
| After `reset_failures()` function | Add function | Add `track_failure_node(state)` that reads `code_output`, increments counter on error, resets on success |

### `backend/graph.py`
| Location | Change type | What to do |
|----------|-------------|------------|
| Import block | Add import | `from burnout_guard import track_failure_node` |
| After `workflow.add_node("burnout_intervention", ...)` | Add node | `workflow.add_node("track_failure", track_failure_node)` |
| `workflow.add_conditional_edges("code_sandbox", burnout_router, {...})` | Replace | Change to: `workflow.add_edge("code_sandbox", "track_failure")` then `workflow.add_conditional_edges("track_failure", burnout_router, {...})` |

### `backend/skill_passport.py`
| Location | Change type | What to do |
|----------|-------------|------------|
| Line ~35, inside challenges query | Fix table name | Change `"challenge_results"` → `"challenge_attempts"` |

### `backend/recruiter_proxy.py`
| Location | Change type | What to do |
|----------|-------------|------------|
| Line where `passport.get("verified_skills", [])` is called | Fix key | Change to `passport.get("skill_verdict", "No verdict yet")` and remove the top_skills slicing; or build skills list from a separate audit call |
| Line where `passport.get("github_trust_score", 0)` is called | Fix key | Change to `passport.get("trust_score", 0)` |

### `backend/supabase_schema.sql`
| Location | Change type | What to do |
|----------|-------------|------------|
| After `challenge_attempts` table | Add table | Add `skill_passports` table definition with `user_id`, `readiness_score`, `trust_score`, `challenges_passed`, `interview_sessions`, `skill_verdict`, `verification_hash`, `generated_at` fields + RLS policies |

### `backend/main.py`
| Location | Change type | What to do |
|----------|-------------|------------|
| Import block | Add import | `from rate_limiter import public_rate_limit, llm_rate_limit` |
| `/api/audit/{username}` route signature | Add dependency | Add `_: None = Depends(public_rate_limit)` parameter |
| `/api/challenge/new` route signature | Add dependency | Add `_: None = Depends(llm_rate_limit)` parameter |
| `/api/kanban/add` route body | Fix bug | Replace inline `db_manager.supabase.table("applications").insert(app_dict)` with `kanban.add_application(app, user_id)` so `user_id` is passed |

### `backend/requirements.txt`
| Location | Change type | What to do |
|----------|-------------|------------|
| Lines with numpy and pandas | Remove | Delete `numpy>=2.0.0` and `pandas>=2.2.0` — neither is imported in any backend file |

### `frontend/src/app/challenge/page.tsx`
| Location | Change type | What to do |
|----------|-------------|------------|
| All occurrences of `challenge.description` | Fix field name | Replace with `challenge.scenario` to match backend `CursedChallenge` Pydantic model |

### `frontend/src/app/passport/page.tsx`
| Location | Change type | What to do |
|----------|-------------|------------|
| `useEffect` with `setTimeout` mock | Replace | Import `getPassport` from `@/lib/api`; fetch Supabase session username; call `getPassport(username)` and map response keys to the page's `PassportData` interface |

### `frontend/src/app/roadmap/page.tsx`
| Location | Change type | What to do |
|----------|-------------|------------|
| `generateRoadmap()` fetch headers | Fix auth | Import `getAuthHeaders` from `@/lib/api`; add `headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) }` |

---

## 8. README rewrite blueprint

The current README is actually strong — it has the architecture diagram, sample outputs, all 5 engines explained, Quick Start, configuration table, and project structure. The rewrite is surgical, not a full replacement.

### Suggested header block
```markdown
# CareerForge ⚔️

**The AI Career OS that fights AI with AI — adversarially verifying skills through 
deliberate code sabotage so candidates can prove, not claim, their competence.**

[![Build Status](https://github.com/Mannava-Daasaradhi/CareerForge/actions/workflows/ci.yml/badge.svg)](...)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB...)]
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000...)]
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688...)]
[![LangGraph](https://img.shields.io/badge/LangGraph-Stateful_Agents-FF6B00...)]
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow...)]
[![Live Demo](https://img.shields.io/badge/Live_Demo-Railway-blueviolet...)]  ← ADD

![CareerForge Demo](assets/demo.gif)  ← FILL IN THE PLACEHOLDER
```

### Sections the README must contain

1. **What it does** — The current "The Problem" + "The 5 Engines" sections are good. Keep them. Trim the engine descriptions to 2 sentences each for scannability.
2. **Why it's interesting** — Add a "How is this different from LeetCode / LinkedIn" callout box. The adversarial verification angle is genuinely novel; it needs a standalone paragraph, not just a buried bullet.
3. **Architecture** — Current Mermaid diagram is excellent. Add a rendered PNG export of it (`assets/architecture.png`) as a fallback for scrapers and social previews.
4. **Results / benchmarks** — **Currently missing.** Add a table: "Auditor performance on 40 accounts (20 genuine / 20 AI-generated): Precision X%, Recall Y%". Run the test. Publish the number. Even rough numbers are more compelling than no numbers.
5. **Quick start** — Current setup is 6 steps and clear. The only addition needed: mention `frontend/.env.local.example` in the frontend setup step.
6. **Project structure** — Current structure block is accurate and annotated. Keep it.
7. **How it works** — The 5 Engines section covers this. Consider adding a "One-turn walkthrough" — narrative of exactly what happens when a user submits an audio answer, which nodes fire, and what state changes.
8. **Roadmap** — Current roadmap is realistic and honest. Keep it. Mark completed items with ✅ as they ship.
9. **Citation / acknowledgements** — Add acknowledgements to Groq (free inference), Gemini (free Shadow Auditor), Piston (free code sandbox), Supabase (free DB), LangChain/LangGraph (the orchestration layer).

### Suggested demo / visual
Record a screen capture (OBS or Loom):
1. Open `http://localhost:3000`
2. Upload a sample resume PDF
3. Trigger GitHub audit on a test username
4. Generate a Python Generators challenge (difficulty 70)
5. Fix the broken code in the editor
6. View the resulting Skill Passport badge

Export as `assets/demo.gif` (compress with `gifsicle -O3`). Target: under 5MB, 60 seconds max.

### Badges to add
```markdown
[![Live Demo](https://img.shields.io/badge/Live_Demo-Railway-blueviolet?style=flat-square)](https://your-railway-url)
[![Last Commit](https://img.shields.io/github/last-commit/Mannava-Daasaradhi/CareerForge?style=flat-square)](...)
[![Open Issues](https://img.shields.io/github/issues/Mannava-Daasaradhi/CareerForge?style=flat-square)](...)
```

---

## 9. Tech stack

| Layer | Current | Recommended change | Reason |
|-------|---------|--------------------|--------|
| Language | Python 3.11 | Keep | Pattern matching available, good LangChain support |
| LLM (interview) | Llama 3.3 70B via Groq | Keep | Free tier, fast inference, 128K context |
| LLM (auditor) | Gemini 2.0 Flash | Keep | Free tier, multimodal-ready for future resume image parsing |
| LLM orchestration | LangGraph 0.2+ | Keep | Correct tool for stateful agent graphs |
| API framework | FastAPI 0.115 | Keep | Async, auto docs, Pydantic integration |
| Database | Supabase (PostgreSQL) | Keep | Free tier, pgvector enabled for future semantic search |
| Code sandbox | Piston public API | Self-host for production | Public API is rate-limited and has no SLA |
| Graph persistence | MemorySaver (in-memory) | SqliteSaver or PostgresSaver | MemorySaver loses all state on restart |
| Frontend | Next.js 16, React 19 | Keep | App Router, React Compiler enabled |
| Frontend styling | Tailwind + Framer Motion | Keep | Consistent and performant |
| Auth | Supabase Auth | Keep | JWT validation works, free tier |
| Background jobs | APScheduler (standalone script) | Add Procfile + Railway worker dyno | Script has no process manager in deployment |
| Containerization | Docker + docker-compose | Keep | Both Dockerfiles are production-quality |
| CI/CD | GitHub Actions | Expand to run `test_flow.py` | Currently only runs `verify_fix.py` |
| Search | DuckDuckGo (langchain-community) | Keep for now | Zero cost, adequate for job market queries |
| Logging | Mixed print()/logger | Standardize on logger.py | Already written — just needs consistent use |

---

## 10. Dependencies audit

### Current dependencies
All Python dependencies in `requirements.txt` are correctly versioned with `>=` constraints. No pinned-to-exact-patch versions (which is appropriate for a project at this stage). No conflicting pairs detected.

**Unused dependencies (should be removed):**
- `numpy>=2.0.0` — not imported anywhere in backend source
- `pandas>=2.2.0` — not imported anywhere in backend source

**Dependencies used in code but not listed:**
- `framer-motion` is used in `Navbar.tsx` but the `package.json` `dependencies` section does not list it directly. It's currently a transitive dependency through another package. Should be explicitly listed: `"framer-motion": "^11.0.0"` in `frontend/package.json`.

**Dependencies used in code but potentially misconfigured:**
- `google-generativeai>=0.8.0` is in requirements.txt. `shadow_auditor.py` uses `langchain-google-genai` (also listed). Both are needed; no conflict.
- `presidio-analyzer` and `presidio-anonymizer` require spaCy models at runtime. The `Dockerfile` installs the packages but not the spaCy `en_core_web_lg` model. This causes a silent fallback (`SECURITY_ACTIVE = False`) on first run.

### Missing dependencies
- `spacy` model download not in Dockerfile: `RUN python -m spacy download en_core_web_lg` — needed for Presidio PII redaction to actually work
- `apscheduler>=3.10.0` is listed (good) — but `background_worker.py` still has an `ImportError` check for it rather than requiring it at install time

### Recommended final requirements.txt
```
# Core Orchestration
langgraph>=0.2.0
langchain>=0.3.0
langchain-core>=0.3.0
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

# Document Processing (The Airlock)
pdf2image>=1.17.0
pytesseract>=0.3.10
pypdf>=4.0.0

# Web Search
duckduckgo-search>=6.3.0

# Background Worker Scheduler
apscheduler>=3.10.0

# REMOVED: numpy, pandas (unused — were adding 200MB to Docker image for no benefit)
```

---

## 11. Setup and run (once complete)

```bash
# Clone
git clone https://github.com/Mannava-Daasaradhi/CareerForge.git
cd CareerForge

# ── SYSTEM DEPENDENCIES ──────────────────────────────
# macOS:
brew install tesseract poppler
# Ubuntu/Debian:
sudo apt-get install -y tesseract-ocr poppler-utils
# Windows (PowerShell):
winget install UB-Mannheim.TesseractOCR
# Download Poppler from https://github.com/oschwartz10612/poppler-windows/releases
# Extract to C:\poppler and add C:\poppler\Library\bin to PATH

# ── BACKEND SETUP ────────────────────────────────────
cd backend
cp .env.example .env
# Edit .env — add GROQ_API_KEY (required) and GOOGLE_API_KEY (required)
# Add GITHUB_TOKEN (optional, prevents rate limiting)
# Add SUPABASE_URL + SUPABASE_KEY (optional, enables persistence)

python -m venv venv
source venv/bin/activate         # Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# ── DATABASE SETUP (optional) ────────────────────────
# Paste contents of supabase_schema.sql into your Supabase SQL editor
# Then update .env with your SUPABASE_URL and SUPABASE_KEY

# ── RUN BACKEND ──────────────────────────────────────
uvicorn main:app --reload --port 8000
# Expected: INFO: Uvicorn running on http://0.0.0.0:8000
# Health check: curl http://localhost:8000/
# → {"status":"active","mode":"stateful_agent"}

# ── FRONTEND SETUP (new terminal) ────────────────────
cd ../frontend
cp .env.local.example .env.local
# Edit .env.local — add NEXT_PUBLIC_API_BASE=http://localhost:8000/api
# Add Supabase keys if using auth

npm install
npm run dev
# Expected: ▲ Next.js — Local: http://localhost:3000

# ── OR: ONE-COMMAND DOCKER SETUP ─────────────────────
# From repo root:
cp backend/.env.example backend/.env
# Edit backend/.env with your keys, then:
docker compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000

# ── RUN TESTS ─────────────────────────────────────────
cd backend
python -m pytest tests/verify_fix.py -v
# → 1 test (auditor offline resilience) — should PASS without any API keys

# Integration tests (requires running backend):
python tests/test_flow.py
# → 6 tests: health, github_audit, challenge_gen, market_demand, recruiter_proxy, roadmap

# ── VERIFY CORE FEATURES ──────────────────────────────
# GitHub audit (no auth required):
curl http://localhost:8000/api/audit/torvalds
# → {"username":"torvalds","trust_score":100,...}

# Challenge generation (requires GROQ_API_KEY):
curl -X POST http://localhost:8000/api/challenge/new \
  -H "Content-Type: application/json" \
  -d '{"topic": "Python Generators", "difficulty": 70}'
# → {"title":"...","scenario":"...","broken_code":"...","test_cases":[...]}
```

---

## 12. Key decisions that need to be made

- **LangGraph checkpointer in production**: `MemorySaver` (current) loses all state on restart. `SqliteSaver` persists to a local file (breaks on multi-instance deployment). `PostgresSaver` (via the `langgraph-checkpoint-postgres` package) uses Supabase's existing Postgres connection and is the correct production choice. Decision: upgrade to PostgresSaver when deploying to Railway; keep MemorySaver for local dev.

- **Background worker process model**: The `background_worker.py` is a standalone Python script with no process supervisor. Two options: (A) add it as a Railway worker dyno via `Procfile` (zero cost, separate restart lifecycle); (B) integrate APScheduler into the FastAPI startup event (`@app.on_event("startup")`), which is simpler but means the scheduler shares the web worker's process and restarts. Recommendation: option A — separate process is more resilient and matches the existing file structure.

- **Piston API self-hosting**: The current default uses `https://emkc.org/api/v2/piston` (public, rate-limited, no SLA). For production, self-hosting Piston via Docker is free and eliminates rate limits. Decision: add a `docker-compose.yml` service for Piston and update `.env.example`'s `PISTON_API_URL` default.

- **Skill Passport as a verifiable credential vs. a trust score**: The current `verification_hash` is a SHA-256 of internal data — the `hash_note` correctly labels it "not an external cryptographic proof." A future decision: issue passports as signed JWTs (signing key held by CareerForge) so they're portable and tamper-evident. This is a significant scope increase but dramatically elevates the value proposition. Not needed for MVP.

- **GitHub commit entropy thresholds**: The roadmap mentions detecting AI-generated code via diff entropy, but the auditor currently only measures account age and push frequency. Before implementing entropy analysis, a threshold for "AI-slop vs. genuine" needs to be calibrated empirically (run on a labeled dataset). Don't implement this without publishing the confusion matrix — otherwise it's an unverifiable claim.

- **Frontend auth requirement**: Currently most routes require `Authorization: Bearer <token>`, but the `demo.gif` / first-time experience requires a Supabase account. Consider adding a "guest mode" (dev fallback already exists in the backend) where the frontend can skip auth and use `user_id: "guest"` for public demos. This is optional but significantly lowers the "try it" barrier.

---

## 13. What would make this genuinely impressive

The project is already architecturally interesting. To become something an engineer bookmarks and shares rather than just stars, it needs three things:

**1. A published benchmark that proves the premise.** The entire project rests on the claim that the GitHub Auditor can distinguish AI-faked accounts from genuine contributors, and that the Cursed Sandbox can't be bypassed by copying from ChatGPT. Neither claim is backed by numbers. Run the auditor against 50 accounts with known ground truth (AI-slop repos created for the test vs. genuine contributors); publish precision/recall. Run the challenge generator 20 times on GPT-4's output and count how many it detects as "fix the bug" vs. "here's a working solution." Put the table in the README. This is 2-3 hours of work and converts the project from "interesting idea" to "demonstrated technique."

**2. A real deployed instance with a live demo URL.** `railway.toml` already exists. The backend is ready to deploy. The single missing step is filling in the Vercel URL in `main.py`'s CORS origins. A live URL in the README eliminates the biggest barrier to engagement: having to set up the whole stack to see it work. The Groq and Gemini free tiers can handle substantial traffic.

**3. The commit entropy analyzer.** The roadmap lists it as a future feature but it's actually the most technically novel part of the entire concept. Measuring Shannon entropy of commit diffs to detect AI-generated code patterns is a real research question. Implementing it, calibrating it, and publishing the methodology would make CareerForge citable — a tool that a hiring platform or a researcher studying AI-fraud in open source would actually reference. This is the leap from "impressive portfolio project" to "project that gets mentioned in articles about AI hiring."

---

## 14. Star-worthiness checklist

### Must-have (project is not shareable without these)
- [x] Runs end-to-end without crashing from a fresh clone — **after Phase 1 fixes**
- [x] README explains what the project does in the first paragraph
- [x] Setup is achievable in under 5 commands (with Docker)
- [x] At least one concrete result, output, or demo is shown (sample JSON outputs in README)
- [x] No hardcoded absolute paths, API keys, or secrets in code
- [x] requirements.txt / pyproject.toml is complete and pinned
- [x] LICENSE file is present (MIT)

### Should-have (separates good repos from great ones)
- [x] Architecture diagram in README (Mermaid — excellent)
- [ ] Results table with numbers — **MISSING: no benchmark published**
- [x] At least one working example script or notebook (test_flow.py)
- [ ] Reproducible results (fixed random seeds) — LLM calls use temperature but no seeds; non-deterministic by design
- [x] Proper logging — logger.py present; needs consistent use across all modules
- [x] Meaningful error messages and exception handling
- [x] Type hints on all public functions (backend) — mostly present; frontend api.ts fully typed
- [x] Docstrings on all public classes and functions — present on most; a few missing
- [x] .gitignore covers all generated files and secrets

### Nice-to-have (makes it genuinely star-worthy)
- [ ] Demo GIF or video in README — **placeholder exists, GIF not recorded yet**
- [x] Docker / docker-compose for one-command setup
- [x] GitHub Actions CI running tests on every push
- [ ] Comparison to baseline or SOTA — no benchmark published
- [x] Contribution guide (CONTRIBUTING.md) — excellent, detailed
- [ ] Changelog (CHANGELOG.md) — missing
- [x] Pre-commit hooks for formatting and linting
- [ ] Model card or data card — not present
- [ ] Interactive demo (hosted link) — Railway deploy not done yet
- [ ] Paper or blog post link — not present

---

## Progress tracking note

*This document is the second version of the analysis (first version was `CareerForge_Analysis.md` in the repo, dated April 20, 2026). The current version reflects a significantly more complete codebase: `public_routes.py` has been patched from hardcoded mock data to real function calls; `resume_parser.py` was rewritten to always return a dict (fixing the str-vs-dict inconsistency that broke callers); `skill_passport.py` was patched to query by `user_id` instead of `session_id` for interview logs; `kanban.py` was rewritten with full CRUD and `user_id` support; `background_worker.py` was upgraded from a bare `while True: time.sleep(3600)` loop to APScheduler with proper job scheduling and graceful shutdown; `rate_limiter.py`, `logger.py`, and `CONTRIBUTING.md` were added as new files. The six bugs documented in Section 4 (broken imports, burnout counter, red_team_verdict state field, passport table name, recruiter_proxy key names, frontend mock pages) are the remaining gaps between the current state and a clean cold-start run.*