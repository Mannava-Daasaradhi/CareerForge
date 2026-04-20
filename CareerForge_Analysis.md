# CareerForge — Complete Analysis & Star-Worthiness Upgrade Plan

> A LangGraph-powered, multi-agent career operating system that combats AI-faked skills by running candidates through adversarial code sandboxes, voice confidence analysis, and GitHub entropy audits — then minting them a cryptographically-signed Skill Passport that recruiters can interrogate via a Digital Twin chatbot.

**Analyzed:** April 20, 2026  
**Completion:** ~65% — Most agents are implemented and wired together, but several integration gaps, dependency errors, and data-mocking shortcuts prevent a clean cold-start run.  
**Verdict:** WORKING BUT ROUGH

---

## 1. What this project is

### Purpose
CareerForge addresses the collapse of trust in technical hiring caused by "Vibecoding" — candidates using AI to fake skills they don't have. It deploys a swarm of autonomous agents to adversarially verify skills (broken code sandboxes, GitHub commit-entropy audits, voice nervousness detection), then compiles results into a portable "Skill Passport" that replaces unverifiable resume claims. The outcome is a two-sided platform: candidates get a career command center, recruiters get a verified talent signal.

### Who it's for
Software engineering candidates (junior to mid-level) who want AI-assisted job hunting, interview prep, and verifiable skill credentials, and recruiters who want signal over noise in an AI-saturated applicant pool.

### What makes it interesting

- **LangGraph stateful multi-agent graph with real persistence**: The interview engine uses `MemorySaver` checkpointing so burnout state, failure counters, and conversation history survive across API calls — this is architecturally more sophisticated than the typical stateless LLM endpoint.
- **Adversarial verification loop**: The "Cursed Sandbox" generates *deliberately broken* code based on the candidate's own claims, then verifies their fix via the Piston API — a genuinely creative approach to defeating faked competence.
- **Zero-cost infrastructure thesis**: The entire AI stack runs on free tiers (Groq for Llama inference, Gemini Flash for vision, Supabase for PostgreSQL) — it's a real deployment architecture, not a toy.

### Current state in one paragraph
The backend is the strong half of this repo. Most of the 20+ Python modules are meaningfully implemented — the LangGraph graph compiles and runs, the Groq/Gemini calls are real, the Piston sandbox integration works, and the Supabase schema with RLS policies is production-worthy. However, several integration seams have broken silently: `requirements.txt` has a syntax error that breaks `pip install`, `pypdf` is used in code but `pymupdf` is listed instead, `langchain-community` is missing entirely, the `demand_analyzer` is imported but commented out so its API routes don't exist, the burnout failure counter never actually increments (so burnout protection is always dormant), `red_team.py` is fully written but wired to nothing, and the frontend roadmap/dashboard pages use `setTimeout` mock data instead of calling the real API. The frontend itself is visually impressive — a consistent cyberpunk aesthetic with Framer Motion animations — but the Navbar has a hardcoded score, the API base URL is hardcoded to `localhost:8000` with no environment variable, and there's no frontend `.env.example`. To get this to a genuinely impressive, runnable state requires fixing roughly a dozen specific issues, none of which require rewriting core logic.

---

## 2. Repository structure

```
CareerForge/
├── Readme.md                    ✅ Good narrative, missing setup steps & screenshots
├── .gitignore                   ✅ Correct — covers .env, node_modules, __pycache__
├── LICENSE                      ❌ MISSING — README claims MIT but no file exists
│
├── backend/
│   ├── main.py                  ✅ FastAPI entrypoint, 15+ routes, auth, CORS
│   ├── graph.py                 ✅ LangGraph stateful workflow (compiles & runs)
│   ├── agent_state.py           ✅ TypedDict with burnout tracking fields
│   ├── interviewer.py           ✅ Lead interviewer LangGraph node (Llama 3.3)
│   ├── shadow_auditor.py        ✅ Silent Gemini critique node
│   ├── burnout_guard.py         🔶 Implemented but counter never increments (bug)
│   ├── auditor.py               ✅ GitHub trust scorer + deep repo context
│   ├── database.py              ✅ Supabase singleton with graceful offline fallback
│   ├── resume_parser.py         🔶 Works but returns str not dict in success path
│   ├── voice_processor.py       ✅ Groq Whisper + confidence metrics
│   ├── challenge_generator.py   ✅ Structured output "Cursed Challenge" generation
│   ├── code_sandbox.py          ✅ Piston API execution + LangGraph node
│   ├── roadmap_generator.py     ✅ Structured weekly roadmap generation
│   ├── skill_passport.py        🔶 Works but interview score aggregation has bug
│   ├── negotiator.py            ✅ Coach + HR opponent negotiation simulation
│   ├── networking_agent.py      ✅ Proof-based cold outreach generation
│   ├── ab_tester.py             ✅ Two-variant resume generator
│   ├── kanban.py                🔶 CRUD works, analyze_rejection not exposed as route
│   ├── job_fetcher.py           ✅ DuckDuckGo + AI structured job hunting
│   ├── demand_analyzer.py       🔶 Implemented but import is COMMENTED OUT in main.py
│   ├── background_worker.py     🔶 Standalone script, not integrated into startup
│   ├── red_team.py              🔶 Fully written but never imported or wired into graph
│   ├── recruiter_proxy.py       ✅ Digital twin with passport evidence
│   ├── public_routes.py         🔶 MOCK DATA — hardcoded, no DB reads
│   ├── resume_tailor.py         ✅ Ghostwriter engine with structured output
│   ├── supabase_schema.sql      ✅ Complete schema with RLS, triggers, extensions
│   ├── .env.example             🔶 Missing GITHUB_TOKEN entry
│   ├── requirements.txt         ❌ Syntax error (pandas===), missing pypdf, langchain-community, google-generativeai
│   └── tests/
│       ├── test_flow.py         🔶 Integration tests — 2 of 6 hit non-existent routes
│       ├── test_gemini.py       🔶 Smoke test script, not a proper unittest
│       ├── model.py             🔶 Debug utility, not a test
│       └── verify_fix.py        ✅ Proper unittest for auditor offline resilience
│
└── frontend/
    ├── package.json             ✅ Pinned deps, Next.js 16, React 19
    ├── next.config.ts           ✅ React Compiler enabled
    ├── tailwind.config.ts       ✅ Standard config
    ├── tsconfig.json            ✅ Standard TS config
    ├── eslint.config.mjs        ✅ Standard lint config
    ├── postcss.config.mjs       ✅ Standard
    ├── .gitignore               ✅ Correct
    ├── README.md                🔶 Default Next.js README, not project-specific
    ├── public/                  🔶 Only default Next.js SVGs, no project assets
    └── src/
        ├── lib/api.ts           🔶 Hardcoded localhost:8000, missing env var; 2 functions call non-existent routes
        ├── components/
        │   └── Navbar.tsx       🔶 Hardcoded userScore=78, no real auth state
        └── app/
            ├── layout.tsx       ✅ Root layout with fonts and metadata
            ├── globals.css      ✅ Tailwind base
            ├── page.tsx         ✅ Landing page — complete, polished
            ├── login/page.tsx   ✅ Real Supabase auth with cyberpunk UI
            ├── dashboard/page.tsx 🔶 Mock data (setTimeout), no real API calls
            ├── interview/page.tsx ✅ Voice recording + real backend calls
            ├── resume/page.tsx  ✅ Upload + audit + tailor + AB tabs
            ├── kanban/page.tsx  ✅ Drag-drop board with rejection modal
            ├── hunter/page.tsx  ✅ Job search UI with real API call
            ├── challenge/page.tsx 🔶 Type mismatch vs backend CursedChallenge model
            ├── roadmap/page.tsx 🔶 All mock data, no backend call
            ├── negotiator/page.tsx ✅ Real API call to /negotiator/start and /chat
            ├── outreach/page.tsx ✅ Real API call to /network/generate
            ├── passport/page.tsx 🔶 Likely mock (uses getPassport but may fail)
            ├── recruiter/page.tsx ✅ Digital twin chat UI
            ├── experiments/page.tsx ✅ Resume A/B test UI
            └── candidate/[username]/page.tsx ✅ Public profile page (uses mock public route)
    ├── frontend/.env.local.example  ❌ MISSING — Supabase env vars not documented
    ├── Dockerfile               ❌ MISSING
    ├── docker-compose.yml       ❌ MISSING
    └── .github/workflows/       ❌ MISSING — No CI
```

---

## 3. Completion status

**Overall: ~65% complete**

| Component | File(s) | Status | What's done | What's missing |
|-----------|---------|--------|-------------|----------------|
| LangGraph Interview Graph | `graph.py`, `agent_state.py` | ✅ Done | Full stateful graph, MemorySaver, burnout routing | — |
| Lead Interviewer Node | `interviewer.py` | ✅ Done | Dynamic prompt injection, critique integration | — |
| Shadow Auditor Node | `shadow_auditor.py` | ✅ Done | Gemini-powered real-time critique | — |
| Burnout Guard | `burnout_guard.py` | 🔶 Partial | Router logic and intervention node exist | Counter never increments (critical bug) |
| Red Team Node | `red_team.py` | 🔶 Dead code | Fully written over-engineering detector | Never imported, never wired into graph, field missing from InterviewState |
| GitHub Auditor | `auditor.py` | ✅ Done | Trust scoring, deep repo context fetch | GITHUB_TOKEN not in .env.example |
| Voice Processor | `voice_processor.py` | ✅ Done | Whisper transcription, confidence analysis | — |
| Resume Parser | `resume_parser.py` | 🔶 Partial | OCR + PyPDF fallback, AI analysis | Returns str on success, dict on error — type inconsistency |
| Resume Tailor | `resume_tailor.py` | ✅ Done | Ghostwriter structured output | — |
| Challenge Generator | `challenge_generator.py` | ✅ Done | Pydantic structured output challenges | — |
| Code Sandbox | `code_sandbox.py` | ✅ Done | Piston API + LangGraph node | — |
| Job Fetcher | `job_fetcher.py` | ✅ Done | DuckDuckGo search + AI filtering | langchain-community not in requirements |
| Demand Analyzer | `demand_analyzer.py` | 🔶 Disabled | Full implementation | Import commented out in main.py; routes don't exist |
| Roadmap Generator | `roadmap_generator.py` | ✅ Done | Structured weekly plan generation | — |
| Skill Passport | `skill_passport.py` | 🔶 Partial | GitHub trust + DB aggregation | Interview log query uses empty session_id string, never scores correctly |
| Negotiator | `negotiator.py` | ✅ Done | Coach + HR agent, structured output | — |
| Networking Agent | `networking_agent.py` | ✅ Done | Proof-based cold email | — |
| AB Tester | `ab_tester.py` | ✅ Done | Two resume variants generation | — |
| Kanban | `kanban.py` | 🔶 Partial | CRUD ops + rejection analysis | `analyze_rejection` never exposed as API route |
| Recruiter Proxy | `recruiter_proxy.py` | ✅ Done | Digital twin with evidence | — |
| Public Routes | `public_routes.py` | 🔶 Stub | Router registered, returns mock data | Hardcoded data — must read from DB |
| Background Worker | `background_worker.py` | 🔶 Partial | Autonomous job hunt loop | No startup integration, no scheduler |
| Database | `database.py` | ✅ Done | Supabase client, offline fallback, logging | — |
| Supabase Schema | `supabase_schema.sql` | ✅ Done | RLS, triggers, uuid-ossp | No migration runner, manual-apply only |
| FastAPI Routes | `main.py` | 🔶 Partial | 15 routes implemented | Missing: /audit/deep, /career/demand, /kanban/reject |
| Dependencies | `requirements.txt` | ❌ Broken | Partial list | Syntax error; missing pypdf, langchain-community, google-generativeai; pymupdf listed but not used |
| Frontend ENV | `.env.local.example` | ❌ Missing | — | Supabase keys undocumented for frontend |
| Frontend API client | `src/lib/api.ts` | 🔶 Partial | All major calls defined | Base URL hardcoded to localhost; 2 functions call non-existent routes |
| Landing Page | `page.tsx` | ✅ Done | Complete, animated, polished | — |
| Login | `login/page.tsx` | ✅ Done | Real Supabase auth, cyberpunk UI | — |
| Dashboard | `dashboard/page.tsx` | 🔶 Mock | UI complete | All data is setTimeout mock, no real API calls |
| Interview | `interview/page.tsx` | ✅ Done | Voice + text, real backend calls | — |
| Resume | `resume/page.tsx` | ✅ Done | Upload/audit/tailor/AB tabs, real calls | — |
| Kanban | `kanban/page.tsx` | ✅ Done | Drag-drop, rejection modal | — |
| Challenge | `challenge/page.tsx` | 🔶 Partial | UI complete, API call exists | Type mismatch: frontend Challenge ≠ backend CursedChallenge |
| Roadmap | `roadmap/page.tsx` | 🔶 Mock | UI complete with skill tree | All mock data, never calls /api/career/roadmap |
| Hunter | `hunter/page.tsx` | ✅ Done | Search UI, real API call | — |
| Tests | `tests/` | 🔶 Partial | 1 real unittest, 3 integration scripts | 2 integration tests hit non-existent endpoints; no pytest config; no coverage |
| Docker/CI/CD | — | ❌ Missing | — | No Dockerfile, no docker-compose, no GitHub Actions |
| LICENSE | — | ❌ Missing | Badge says MIT but no file | — |

---

## 4. Deep code analysis

### What is fully working

- **`GitHubAuditor.calculate_trust_score()`** in `auditor.py`
  - Does: Fetches user data + public events, computes weighted trust score (account age, push frequency, repo count), returns verdict dict.
  - Quality: Good. Graceful `_safe_get` wrapper handles all network errors.

- **`GitHubAuditor.fetch_top_repo_context()`** in `auditor.py`
  - Does: Finds top-starred repo, fetches README + 2 code files (Base64 decoded), truncates to 2000 chars each.
  - Quality: Good. Smart token management.

- **`lead_interviewer_node()`** in `interviewer.py`
  - Does: Reads state, builds dynamic system prompt injecting shadow critique, handles empty state for intro message.
  - Quality: Good. Clear conditional injection logic.

- **`shadow_auditor_node()`** in `shadow_auditor.py`
  - Does: Analyzes last user message with Gemini, skips if last message is AI, handles missing API key gracefully.
  - Quality: Good. API fallback is clean.

- **`code_execution_node()`** in `code_sandbox.py`
  - Does: Regex-extracts code blocks from user messages, executes each via Piston API, appends output as SystemMessage.
  - Quality: Good. Handles multiple code blocks, combines stdout + stderr.

- **`execute_code()`** in `code_sandbox.py`
  - Does: POSTs to Piston API with language mapping, parses response, returns combined output string.
  - Quality: Good.

- **`generate_challenge()`** in `challenge_generator.py`
  - Does: Structured output generation of `CursedChallenge` Pydantic model with fallback on LLM error.
  - Quality: Good. Fallback is sensible.

- **`generate_learning_roadmap()`** in `roadmap_generator.py`
  - Does: Structured output `CareerRoadmap` with weekly milestones and daily tasks including resource links.
  - Quality: Good. Early return for empty skill_gaps.

- **`start_negotiation_scenario()` / `run_negotiation_turn()`** in `negotiator.py`
  - Does: Two-phase — stingy HR generates initial offer, then coach audits the user's counter-move, then HR agent responds with potential offer improvement.
  - Quality: Good. The inner `TurnResult` subclass pattern is clever.

- **`analyze_resume()`** in `resume_parser.py`
  - Does: Tries OCR first (rasterize → Tesseract), falls back to PyPDF, guards against empty/short text, truncates at 20k chars.
  - Quality: Good architecture, but the success return type is `str` (LLM response content) while error cases return `dict` — callers must handle both.

- **`DatabaseManager`** in `database.py`
  - Does: Validates env vars, creates Supabase client only if non-placeholder URL found, logs interactions gracefully skipping on failure.
  - Quality: Excellent. The `.env.example` placeholder check (`"your-project" not in url`) prevents crashes on unconfigured environments.

- **Supabase schema** in `supabase_schema.sql`
  - Does: Enables uuid-ossp, creates 4 tables, sets RLS on all, adds correct policies, creates auth trigger for automatic profile creation.
  - Quality: Production-worthy.

- **`VoiceProcessor.process_audio()`** in `voice_processor.py`
  - Does: Groq Whisper transcription with technical prompt hint, then confidence/clarity/filler analysis.
  - Quality: Good. The confidence metric formula is simplistic but functional.

### What is partially implemented

#### Burnout Guard — `burnout_guard.py`
- **What exists:** `burnout_router()` checks `consecutive_failures` from state and routes to intervention at `>= 2`.
- **What's broken:** `burnout_router` is a routing function — it returns a node name string, not a state dict update. It never writes `consecutive_failures += 1` back to state. Since LangGraph routing functions can't mutate state, and no other node increments the counter, `consecutive_failures` is always 0. Burnout intervention **never triggers**.
- **What's missing:** A node that wraps the router logic and also updates the state, or moving the counter increment into `code_execution_node`'s return dict.
- **Exact fix:**
  ```python
  # In code_sandbox.py -> code_execution_node(), add to the return dict:
  def code_execution_node(state: InterviewState):
      ...
      if outputs:
          final_output = "\\n\\n".join(outputs)
          is_failure = "Error" in final_output or "Traceback" in final_output
          new_failures = state.get("consecutive_failures", 0) + (1 if is_failure else 0)
          if not is_failure:
              new_failures = 0  # reset on success
          return {
              "messages": [SystemMessage(content=f"SYSTEM_SANDBOX_OUTPUT:\\n{final_output}")],
              "code_output": final_output,
              "consecutive_failures": new_failures
          }
      return {}
  ```
- **Estimated effort:** 30 minutes

#### Skill Passport — `skill_passport.py`
- **What exists:** Fetches GitHub trust, tries to pull challenge passes and interview logs from DB.
- **What's broken:** The interview log query is `.eq("session_id", session_id if session_id else "")` — when called from `recruiter_proxy.py` or `networking_agent.py` without a session_id, it passes an empty string and returns zero logs. Score boost from practice never applies.
- **What's missing:** A user-id-based query instead of session-id-based, since the endpoint has user_id available.
- **Exact fix:**
  ```python
  # Replace the logs query in skill_passport.py with user-based:
  logs = db_manager.supabase.table("interview_logs") \
      .select("id") \
      .eq("user_id", username)  # or pass user_id as parameter
      .execute()
  ```
- **Estimated effort:** 1 hour (requires threading user_id through call chain)

#### Public Routes — `public_routes.py`
- **What exists:** Router with `/api/public/profile/{username}` and `/api/public/twin/{username}/ask`.
- **What's broken:** Profile returns entirely hardcoded data with `random.randint` variation. Digital twin uses `if/elif` keyword matching instead of real LLM.
- **What's missing:** DB lookup for actual passport data; LLM call for twin responses.
- **Exact fix:**
  ```python
  # In get_public_profile(), replace hardcoded dict with:
  from skill_passport import get_skill_passport
  return get_skill_passport(username)
  
  # In ask_digital_twin(), replace keyword matching with:
  from recruiter_proxy import query_digital_twin
  result = query_digital_twin(username, req.question)
  return {"reply": result["reply"]}
  ```
- **Estimated effort:** 1 hour

#### Challenge Page Type Mismatch — `frontend/src/app/challenge/page.tsx`
- **What exists:** UI that calls `/api/challenge/new` and renders challenge fields.
- **What's broken:** Frontend `Challenge` interface has `description`, `starter_code` fields. Backend `CursedChallenge` model has `scenario`, `broken_code`, `constraint`, `solution_summary`. The mapping is wrong — `challenge.description` and `challenge.starter_code` will be `undefined`.
- **Exact fix:** Update the frontend interface:
  ```typescript
  interface Challenge {
    title: string;
    scenario: string;      // was: description
    broken_code: string;   // was: starter_code
    constraint: string;
    test_cases: TestCase[];
    solution_summary?: string;
  }
  // And update all JSX references accordingly
  ```
- **Estimated effort:** 30 minutes

### What is completely missing

#### `pypdf` in requirements — critical install failure
- **Why it's needed:** `resume_parser.py` line 4: `from pypdf import PdfReader`. Without it, `import resume_parser` fails at startup, crashing the entire FastAPI app.
- **Where it should live:** `backend/requirements.txt`
- **What it should contain:** `pypdf>=4.0.0`
- **Estimated effort:** 5 minutes

#### `langchain-community` in requirements
- **Why it's needed:** `job_fetcher.py` and `demand_analyzer.py` use `from langchain_community.tools import DuckDuckGoSearchRun`.
- **Where it should live:** `backend/requirements.txt`
- **What it should contain:** `langchain-community>=0.2.0`
- **Estimated effort:** 5 minutes

#### `/api/audit/deep/{username}` route
- **Why it's needed:** `frontend/src/lib/api.ts` `deepAudit()` calls this endpoint. `GitHubAuditor.fetch_top_repo_context()` implements the logic but is never exposed.
- **Where it should live:** `backend/main.py`
- **What it should contain:**
  ```python
  @app.get("/api/audit/deep/{username}")
  async def deep_audit_endpoint(username: str):
      return auditor_agent.fetch_top_repo_context(username)
  ```
- **Estimated effort:** 10 minutes

#### `/api/career/demand` route
- **Why it's needed:** `api.ts` `getMarketDemand()` calls it. `demand_analyzer.py` implements it but is commented out.
- **Where it should live:** `backend/main.py`
- **What it should contain:** Uncomment the import and add:
  ```python
  from demand_analyzer import analyze_market_demand
  
  @app.post("/api/career/demand")
  async def market_demand_endpoint(request: RoadmapRequest, user_id: str = Depends(get_current_user)):
      return analyze_market_demand(request.target_role)
  ```
- **Estimated effort:** 15 minutes

#### `/api/kanban/reject/{app_id}` route
- **Why it's needed:** `kanban.py`'s `analyze_rejection()` is sophisticated agentic logic (creates Phoenix recovery tasks) but is inaccessible.
- **Where it should live:** `backend/main.py`
- **What it should contain:**
  ```python
  @app.post("/api/kanban/reject/{app_id}")
  async def reject_application(app_id: str, feedback: str = "", user_id: str = Depends(get_current_user)):
      from kanban import analyze_rejection
      return analyze_rejection(app_id, feedback)
  ```
- **Estimated effort:** 15 minutes

#### Frontend environment file
- **Why it's needed:** `src/lib/api.ts` reads `process.env.NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Without documentation, new developers can't get the frontend running.
- **Where it should live:** `frontend/.env.local.example`
- **What it should contain:**
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  NEXT_PUBLIC_API_BASE=http://localhost:8000/api
  ```
- **Estimated effort:** 5 minutes

#### `NEXT_PUBLIC_API_BASE` environment variable wiring
- **Why it's needed:** `API_BASE` in `api.ts` is hardcoded to `http://localhost:8000/api`. Deploying to Vercel or any other host will break all API calls.
- **Where it should live:** `frontend/src/lib/api.ts` line 8
- **Exact fix:**
  ```typescript
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";
  ```
- **Estimated effort:** 5 minutes

#### LICENSE file
- **Why it's needed:** README badge says MIT. Without a LICENSE file, the repo has no legal open-source standing.
- **Where it should live:** `LICENSE` (root)
- **Estimated effort:** 5 minutes

### Bugs and crashes

| Location | Issue | Fix |
|----------|-------|-----|
| `requirements.txt:last line` | `pandas===` — syntax error, breaks `pip install -r requirements.txt` entirely | Change to `pandas` or `pandas>=2.0.0` |
| `requirements.txt` | `pymupdf` listed but code uses `pypdf` (`PdfReader`). Both refer to different packages. At startup, `from pypdf import PdfReader` throws `ModuleNotFoundError`, crashing FastAPI | Add `pypdf>=4.0.0` to requirements |
| `requirements.txt` | `langchain-community` missing. `job_fetcher.py:6` `from langchain_community.tools import DuckDuckGoSearchRun` crashes at import | Add `langchain-community>=0.2.0` |
| `burnout_guard.py:burnout_router()` | `consecutive_failures` never incremented, burnout never triggers | Move counter increment into `code_execution_node` return dict (see fix above) |
| `test_flow.py:test_dashboard_pulse()` | Calls `GET /api/career/market-pulse?role=...` which doesn't exist. Will always fail with 404 | Fix test to call POST `/api/career/demand` or re-enable demand_analyzer route |
| `test_flow.py:test_recruiter_proxy()` | Posts `{"question": ...}` missing required `username` field, returns 422 Unprocessable Entity | Add `"username": "test-user"` to payload |
| `frontend/src/lib/api.ts:deepAudit()` | Calls `/api/audit/deep/{username}` — route doesn't exist in `main.py` | Add route (see above) |
| `frontend/src/lib/api.ts:getMarketDemand()` | Calls `/api/career/demand` — route doesn't exist | Uncomment demand_analyzer and add route |
| `challenge/page.tsx` | Renders `challenge.description` and `challenge.starter_code` which are `undefined` — backend sends `scenario` and `broken_code` | Update frontend interface field names |
| `roadmap/page.tsx` | `generateRoadmap()` is a local function using `setTimeout` mock data — never calls backend `/api/career/roadmap` | Replace with real `fetch` call to backend |
| `dashboard/page.tsx` | All briefing data comes from `setTimeout` mock — no `/api/dashboard/status` endpoint exists | Either wire to passport/audit endpoint or add dashboard summary endpoint |
| `Navbar.tsx:userScore` | Hardcoded `const userScore = 78` | Wire to real auth state / passport score |
| `skill_passport.py:120` | Interview log query `.eq("session_id", "")` returns 0 logs when no session_id — score never improves from practice | Use user_id-based query |
| `red_team.py:red_team_node()` | Returns `{"red_team_verdict": ...}` but field not in `InterviewState` — would crash if wired | Add field to InterviewState or wire differently |
| `main.py:verify_challenge` | `test['input_val']` string interpolation in f-string inside a loop — if `input_val` contains quotes or braces, the generated code will have syntax errors | Sanitize or use `repr()` |

### Code quality issues

- **No type hints on return types in `main.py`**: Route functions return `dict` or `Any` implicitly. Pydantic response models would improve documentation and catch bugs.
- **`main.py` hardcodes `"dev-user-id"` fallback**: In the voice endpoint, `user_id = "dev-user-id"` before the auth check. If auth fails silently (exception swallowed), all data gets attributed to the wrong user.
- **`print()` everywhere instead of `logging`**: Every module uses raw `print()`. This makes log filtering in production impossible.
- **`code_sandbox.py` regex is fragile**: The pattern `r"```(\w+)\s*\n(.*?)```"` with `re.DOTALL` will incorrectly capture everything between the first opening fence and the last closing fence if a message contains multiple unrelated code blocks.
- **`demand_analyzer.py` hardcoded years**: `"job market trends 2024 2025"` — will become stale. Should use `datetime.now().year`.
- **No rate limiting on endpoints**: The `/api/audit/{username}` endpoint is unauthenticated and makes GitHub API calls — open to abuse.
- **`kanban.py` `add_application` inserts without `user_id`**: The function takes `Application` (no user_id) and inserts to DB. If the Supabase table requires `user_id` (it does per schema), this will fail for non-null constraint.

---

## 5. Roadmap to star-worthy

### Phase 1 — Make it actually run (critical, do first)

1. **Fix `requirements.txt`**
   - File: `backend/requirements.txt`
   - Action: Edit
   - What to write: Replace the entire file with a clean, pinned version (see Section 10). Change `pandas===` to `pandas>=2.0.0`, add `pypdf>=4.0.0`, add `langchain-community>=0.2.0`, add `google-generativeai>=0.8.0`, remove duplicate/conflicting `pymupdf`.
   - Why: Without this, `pip install -r requirements.txt` fails before any code runs.

2. **Fix the burnout counter increment**
   - File: `backend/code_sandbox.py`
   - Action: Edit `code_execution_node()` to return `consecutive_failures` state update (see exact fix in Section 4).
   - Why: The most architecturally interesting safety feature is completely dormant without this.

3. **Wire `red_team.py` or remove it**
   - File: `backend/agent_state.py`, `backend/graph.py`
   - Action: Either add `red_team_verdict: Optional[str]` to `InterviewState` and import/add the node to the graph between `shadow_auditor` and `code_sandbox`, or delete `red_team.py` to avoid confusion.
   - Why: Dead code in the graph module creates confusion and wastes a genuinely good feature.

4. **Uncomment `demand_analyzer` import and add missing routes**
   - File: `backend/main.py`
   - Action: Uncomment `from demand_analyzer import analyze_market_demand`. Add the three missing routes: `/api/audit/deep/{username}`, `/api/career/demand`, `/api/kanban/reject/{app_id}`.
   - Why: Frontend calls these; failing silently with 404s breaks user-facing features.

5. **Fix `public_routes.py` to read real data**
   - File: `backend/public_routes.py`
   - Action: Replace hardcoded return dict with `get_skill_passport(username)` call in `get_public_profile()`, replace keyword-matching twin with `query_digital_twin()` call.
   - Why: The candidate public profile page (`/candidate/[username]`) is a key recruiter-facing feature and currently shows fake static data.

6. **Create `frontend/.env.local.example`**
   - File: `frontend/.env.local.example`
   - Action: Create with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_BASE` entries.
   - Why: Frontend is completely unconfigurable from docs without this.

7. **Replace hardcoded API_BASE in `api.ts`**
   - File: `frontend/src/lib/api.ts`
   - Action: `const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";`
   - Why: Production deployment to Vercel + any backend host breaks without this.

8. **Fix `challenge/page.tsx` type mismatch**
   - File: `frontend/src/app/challenge/page.tsx`
   - Action: Update `Challenge` interface to use `scenario`, `broken_code`, `constraint` field names. Update all JSX renders.
   - Why: Challenge page renders blank fields from the actual API response.

9. **Add `LICENSE` file**
   - File: `LICENSE` (root)
   - Action: Create with MIT license text, year 2025, author name.
   - Why: Prerequisite for open-source credibility; README already claims MIT.

10. **Add `GITHUB_TOKEN` to `.env.example`**
    - File: `backend/.env.example`
    - Action: Add `GITHUB_TOKEN=ghp_...  # Optional: prevents GitHub API rate limiting`
    - Why: Without it, the GitHub auditor hits rate limits quickly in any real demo.

### Phase 2 — Make it impressive (do second)

1. **Connect `roadmap/page.tsx` to the real backend**
   - File: `frontend/src/app/roadmap/page.tsx`
   - What to change: Replace the mock `generateRoadmap` function with a real `fetch` call to `POST /api/career/roadmap` with skill gaps and target role. The backend returns a `CareerRoadmap` with weekly milestones — render these as the skill tree nodes.
   - Impact: Unlocks the full Ghost Tech Lead feature for users.

2. **Connect `dashboard/page.tsx` to real data**
   - File: `frontend/src/app/dashboard/page.tsx`
   - What to change: Replace `setTimeout` mock with a call to `GET /api/passport/{username}` (after auth) to get real readiness score and recent achievements. Show actual Kanban summary from `GET /api/kanban/list`.
   - Impact: Dashboard becomes a real command center instead of a static mockup.

3. **Wire `Navbar.tsx` to auth state**
   - File: `frontend/src/components/Navbar.tsx`
   - What to change: Import `supabase` client, add `useEffect` to call `supabase.auth.getSession()`, fetch passport score for the logged-in user. Display actual score.
   - Impact: The score displayed is no longer always "78".

4. **Replace `print()` with `logging` throughout backend**
   - Files: All `backend/*.py`
   - What to change: Add `import logging; logger = logging.getLogger(__name__)` to each module, replace all `print()` with `logger.info()` / `logger.error()`.
   - Impact: Production observability — log filtering, levels, structured output.

5. **Add `kanban.py:analyze_rejection` to the Kanban frontend**
   - File: `frontend/src/app/kanban/page.tsx`
   - What to change: The UI already has a rejection modal with `feedback` state. Wire the "Confirm Rejection" button to call `POST /api/kanban/reject/{app_id}` and display the returned `phoenix_task_title` and `recovery_plan`.
   - Impact: The agentic rejection recovery loop becomes user-visible — this is a genuinely impressive feature.

6. **Add `background_worker.py` startup instruction**
   - File: `backend/background_worker.py`, `Readme.md`
   - What to change: Add a `Procfile` or document that `python background_worker.py` runs as a separate process. Optionally wrap in a simple schedule using `schedule` library.
   - Impact: The "agents work while you sleep" pitch requires this to actually run.

7. **Fix the verify_challenge f-string injection vulnerability**
   - File: `backend/main.py`, `verify_challenge` function
   - What to change: Replace raw string interpolation with `repr(test['input_val'])` and `repr(test['expected_output'])` to prevent code injection through test case values.
   - Impact: Security fix + prevents syntax errors in generated test harness.

### Phase 3 — Make it star-worthy (do last)

1. **Add demo GIF or live demo link to README**
   - What to do: Record a 60-second Loom or screen capture showing: upload resume → get trust score → run challenge → see Skill Passport. Embed in README using `![Demo](demo.gif)`.
   - Why it matters for star-worthiness: Without a demo, no one knows it works. This is the single highest-ROI addition.

2. **Add Dockerfile + docker-compose**
   - What to do: Create `backend/Dockerfile` (Python 3.11 slim, install deps, expose 8000, `CMD uvicorn main:app`). Create root `docker-compose.yml` with `backend` and `frontend` services.
   - Where: Root `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`
   - Why it matters: "One command to run" is a requirement for a forkable project.

3. **Add GitHub Actions CI**
   - What to do: Create `.github/workflows/ci.yml` that runs `pip install -r requirements.txt`, `python -m pytest backend/tests/`, and `npm run build` on every PR.
   - Where: `.github/workflows/ci.yml`
   - Why it matters: The "build passing" badge currently points to nothing. A real CI makes it credible.

4. **Write a proper setup guide in README**
   - What to do: Add a "Getting Started" section with exact commands: clone, `cp .env.example .env`, edit API keys, `pip install`, `uvicorn main:app --reload`, `npm install && npm run dev`. Include expected output.
   - Where: `Readme.md`
   - Why it matters: Current README has architecture but no working setup steps.

5. **Add results/benchmarks section to README**
   - What to do: Run the auditor against a real GitHub user, screenshot the Skill Passport, show a real generated challenge + its solution. Add a "Results" section with actual outputs.
   - Where: `Readme.md`, `assets/` folder
   - Why it matters: A stranger needs to see that this produces real, interesting output.

6. **Add pre-commit hooks**
   - What to do: `pip install pre-commit`, create `.pre-commit-config.yaml` with `ruff` (Python lint), `mypy` (type check), and `prettier` (TypeScript format).
   - Where: `.pre-commit-config.yaml`
   - Why it matters: Signals code hygiene to technical evaluators.

7. **Create `CONTRIBUTING.md`**
   - What to do: Document the project structure, how to add a new agent (implement node, add to InterviewState if needed, wire into graph), and how to add a new frontend page.
   - Why it matters: Separates "someone's project" from "an open-source project".

---

## 6. Files to create from scratch

### `LICENSE`
**Purpose:** Legal open-source standing (currently claimed in README badge but missing)
```
MIT License

Copyright (c) 2025 Mannava-Daasaradhi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
[standard MIT text]
```

### `frontend/.env.local.example`
**Purpose:** Document required frontend environment variables for new developers.
```bash
# Supabase (Frontend Auth)
# Get from: https://supabase.com/dashboard/project/<project>/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API (change for production deployment)
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
```

### `backend/Dockerfile`
**Purpose:** Containerize backend for one-command deployment.
```dockerfile
FROM python:3.11-slim

# Install system deps for OCR (tesseract) and PDF processing (poppler)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `docker-compose.yml`
**Purpose:** Single-command full-stack startup.
```yaml
version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE=http://localhost:8000/api
    env_file:
      - ./frontend/.env.local
    depends_on:
      - backend
```

### `.github/workflows/ci.yml`
**Purpose:** Real CI to back the "build passing" badge.
```yaml
name: CI

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Install deps
        run: pip install -r backend/requirements.txt
      - name: Run tests
        working-directory: backend
        run: python -m pytest tests/verify_fix.py -v

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Install deps
        working-directory: frontend
        run: npm ci
      - name: Build
        working-directory: frontend
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: "https://placeholder.supabase.co"
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "placeholder"
```

### `backend/logger.py`
**Purpose:** Shared logger configuration to replace all `print()` calls.
```python
import logging
import sys

def get_logger(name: str) -> logging.Logger:
    """Returns a configured logger for the given module name."""
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter(
            "%(asctime)s [%(name)s] %(levelname)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        ))
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    
    return logger

# Usage in any module:
# from logger import get_logger
# logger = get_logger(__name__)
# logger.info("Processing resume...")
```

---

## 7. Files to modify

### `backend/requirements.txt`

| Location | Change type | What to do |
|----------|-------------|------------|
| `pandas===` (last line) | Fix bug | Change to `pandas>=2.0.0` |
| After `pymupdf` | Clarify | Add comment: `# Note: pymupdf is fitz, NOT used in resume_parser.py` or remove if unused |
| After `pymupdf` | Add dependency | Add `pypdf>=4.0.0` |
| After `langchain-google-genai` | Add dependency | Add `langchain-community>=0.2.0` |
| After `langchain-community` | Add dependency | Add `google-generativeai>=0.8.0` |
| After `requests` | Add dependency | Add `duckduckgo-search>=6.0.0` (the underlying package for DuckDuckGoSearchRun) |

### `backend/main.py`

| Location | Change type | What to do |
|----------|-------------|------------|
| Line 27 (commented out import) | Fix | Uncomment `from demand_analyzer import analyze_market_demand` |
| After `/api/audit/{username}` route | Add feature | Add `GET /api/audit/deep/{username}` route calling `auditor_agent.fetch_top_repo_context(username)` |
| After `/api/career/hunt` | Add feature | Add `POST /api/career/demand` route with a Pydantic model `DemandRequest(role: str, location: str = "Remote")` calling `analyze_market_demand()` |
| After `/api/kanban/update` | Add feature | Add `POST /api/kanban/reject/{app_id}` route calling `analyze_rejection(app_id, feedback)` |
| `voice_chat_endpoint`, line with `user_id = "dev-user-id"` | Fix bug | Move this fallback *inside* the `if not db_manager.enabled` branch to prevent silent auth bypass |

### `backend/burnout_guard.py` / `backend/code_sandbox.py`

| Location | Change type | What to do |
|----------|-------------|------------|
| `code_execution_node()` return statement | Fix bug | Return `consecutive_failures` state update as described in Section 4. Track success (reset to 0) and failure (increment). Also add `code_output` to the return dict so `burnout_router` can read it via state instead of reconstructing. |

### `backend/agent_state.py`

| Location | Change type | What to do |
|----------|-------------|------------|
| After `is_burnout_risk: bool` | Add field | Add `red_team_verdict: Optional[str]` to enable wiring in `red_team.py` |

### `backend/public_routes.py`

| Location | Change type | What to do |
|----------|-------------|------------|
| `get_public_profile()` return dict | Replace | Import and call `get_skill_passport(username)` |
| `ask_digital_twin()` keyword matching | Replace | Import and call `query_digital_twin(username, req.question)` |

### `backend/.env.example`

| Location | Change type | What to do |
|----------|-------------|------------|
| After `PISTON_API_URL` | Add entry | `GITHUB_TOKEN=ghp_...  # Optional: prevents rate limiting on GitHub API` |

### `frontend/src/lib/api.ts`

| Location | Change type | What to do |
|----------|-------------|------------|
| `const API_BASE = "http://localhost:8000/api"` | Fix | `const API_BASE = process.env.NEXT_PUBLIC_API_BASE \|\| "http://localhost:8000/api"` |

### `frontend/src/app/challenge/page.tsx`

| Location | Change type | What to do |
|----------|-------------|------------|
| `Challenge` interface | Fix bug | Rename `description` → `scenario`, `starter_code` → `broken_code`, add `constraint: string` field |
| All JSX rendering `challenge.description` / `challenge.starter_code` | Fix bug | Update to use new field names |

### `frontend/src/app/roadmap/page.tsx`

| Location | Change type | What to do |
|----------|-------------|------------|
| `generateRoadmap()` local function | Replace | Real API call to `POST /api/career/roadmap` with skill gaps state. Parse `CareerRoadmap` response into `SkillNode` array. |
| Static `mockNodes` array | Delete | Remove once real API is wired |

### `frontend/src/app/dashboard/page.tsx`

| Location | Change type | What to do |
|----------|-------------|------------|
| `setTimeout` mock in `useEffect` | Replace | Call `GET /api/passport/{username}` (after reading session from Supabase auth) to get real readiness score and achievements |

---

## 8. README rewrite blueprint

### Suggested header block
```markdown
# CareerForge ⚔️

**The AI Career OS that fights AI with AI — verifying skills through adversarial code sandboxes
so candidates can prove, not claim, their competence.**

[![Build](https://github.com/Mannava-Daasaradhi/CareerForge/actions/workflows/ci.yml/badge.svg)]()
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)]()
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)]()
[![License](https://img.shields.io/badge/License-MIT-yellow)]()
[![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-orange)]()

[**Demo Video**] · [**Live Demo**] · [**Architecture**] · [**Setup Guide**]

<!-- INSERT DEMO GIF HERE -->
```

### Sections the README must contain

**What it does** — 3-4 sentences. Lead with the problem (AI-faked skills), then the solution (5-engine adversarial verification + autonomous agents), then the output (Skill Passport). Mention zero-cost infrastructure. Suggested length: 1 paragraph.

**Architecture diagram** — A visual showing the 5 engines as a flow: Resume → Airlock → Gauntlet (GitHub Audit + Sandbox) → Interview Engine → Ghost Tech Lead → Sniper. Use a Mermaid diagram or an image. Include the Supervisor-Worker agent topology.

**The 5 Engines** — Brief bullet per engine. Include the key tech for each. Keep current content but add one example output line per engine (e.g., "Trust Score: 73/100 — Low Trust: Sandbox Mode Activated").

**Results / Sample Outputs** — THIS IS MISSING AND CRITICAL. Show a real `trust_score` JSON output, a real generated challenge, a real roadmap snippet, a real cold email draft. Don't describe what outputs look like — show them.

**Quick Start** — Exact commands (see Section 11). Must work from cold start.

**Project Structure** — The current tree in the README is wrong (shows an `agents/` subdirectory that doesn't exist; all agents are flat in `backend/`). Fix to match actual structure.

**Configuration** — Table of all env vars with descriptions and where to get free keys.

**Roadmap / Future Work** — Mention: background worker deployment, full Presidio PII redaction in interview logs, voice stress analysis via audio features (not just text), semantic search over passport history.

**Citation** — If this was a hackathon project or course project, note it.

### Suggested demo / visual
Run the following sequence and record/screenshot each step:
```bash
# 1. GitHub audit demo
curl http://localhost:8000/api/audit/torvalds | python -m json.tool

# 2. Challenge generation  
curl -X POST http://localhost:8000/api/challenge/new \
  -H "Content-Type: application/json" \
  -d '{"topic": "Python Generators", "difficulty": 70}'

# 3. Roadmap generation
curl -X POST http://localhost:8000/api/career/roadmap \
  -H "Content-Type: application/json" \
  -d '{"skill_gaps": ["Redis", "Docker"], "target_role": "Backend Engineer"}'
```
Embed the outputs as code blocks. Record a 45-second GIF of the Interview page (voice or text mode) showing the Shadow Auditor critique appearing after a user answer.

### Badges to add
```markdown
[![Build Status](https://github.com/Mannava-Daasaradhi/CareerForge/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Mannava-Daasaradhi/CareerForge/actions)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white&style=flat-square)](https://python.org)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&style=flat-square)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&style=flat-square)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-Stateful_Agents-FF6B00?style=flat-square)](https://langchain-ai.github.io/langgraph/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Mannava-Daasaradhi/CareerForge?style=flat-square)](https://github.com/Mannava-Daasaradhi/CareerForge/commits/main)
```

---

## 9. Tech stack

| Layer | Current | Recommended change | Reason |
|-------|---------|-------------------|--------|
| Python version | 3.10+ (implied) | Pin to 3.11 explicitly in Dockerfile | Match `match` statement support; performance improvements |
| LangGraph | Unpinned | `langgraph>=0.2.0` | API stability |
| Groq inference | Llama 3.3 70B | Keep — excellent choice | Sub-second latency on free tier |
| Gemini | gemini-2.0-flash in code, 1.5-flash in README | Standardize to `gemini-2.0-flash` throughout | Avoid confusion; 2.0 is better |
| Search | DuckDuckGoSearchRun (langchain-community) | Consider Serper API (free tier) as fallback | DuckDuckGo has rate limit issues in production |
| Database | Supabase (PostgreSQL + pgvector) | Keep — schema is production-quality | RLS policies are done correctly |
| Code execution | Piston public API | Keep for dev; add `PISTON_API_URL` option for self-hosted | Public Piston can be slow |
| PDF processing | pdf2image + pytesseract + pypdf | Keep stack, fix requirements | The OCR → PyPDF fallback approach is correct |
| Frontend framework | Next.js 16 (App Router) | Keep | Latest stable |
| Frontend auth | Supabase Auth helpers | Keep | Already integrated |
| Styling | Tailwind CSS | Keep | Consistent, good output |
| Animations | Framer Motion 12 | Keep | Smooth, production-quality |
| Experiment tracking | None | Skip for now | Not an ML training project |
| Container | None | Add Docker + compose (see Section 6) | Reproducibility |
| CI/CD | None | Add GitHub Actions (see Section 6) | Credibility |
| Logging | print() everywhere | Replace with Python `logging` module | Production observability |
| Type checking | No mypy | Add mypy to CI for backend | Catch bugs before runtime |

---

## 10. Dependencies audit

### Current backend dependencies (with issues)
```
langgraph          # ⚠️ UNPINNED
langchain          # ⚠️ UNPINNED
langchain-groq     # ⚠️ UNPINNED
langchain-google-genai  # ⚠️ UNPINNED
fastapi            # ⚠️ UNPINNED
uvicorn            # ⚠️ UNPINNED
python-dotenv      # ⚠️ UNPINNED
requests           # ⚠️ UNPINNED
supabase           # ⚠️ UNPINNED
presidio-analyzer  # ⚠️ UNPINNED
presidio-anonymizer # ⚠️ UNPINNED
pdf2image          # ⚠️ UNPINNED
pytesseract        # ⚠️ UNPINNED
pymupdf            # ⚠️ LISTED BUT NOT USED IN CODE (code uses pypdf)
numpy              # ⚠️ UNPINNED
pandas===          # ❌ SYNTAX ERROR
```

### Missing dependencies
- `pypdf>=4.0.0` — used in `resume_parser.py`, completely missing
- `langchain-community>=0.2.0` — used in `job_fetcher.py` and `demand_analyzer.py`
- `google-generativeai>=0.8.0` — used in `tests/model.py`
- `duckduckgo-search>=6.0.0` — underlying package for `DuckDuckGoSearchRun`
- `groq>=0.12.0` — used directly in `voice_processor.py` (`from groq import Groq`)

### Recommended `backend/requirements.txt`
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

# Utilities
numpy>=2.0.0
pandas>=2.2.0
```

---

## 11. Setup and run (once complete)

```bash
# 1. Clone
git clone https://github.com/Mannava-Daasaradhi/CareerForge.git
cd CareerForge

# 2. System dependencies (Ubuntu/Debian — required for OCR)
sudo apt-get install tesseract-ocr poppler-utils
# macOS: brew install tesseract poppler

# 3. Backend setup
cd backend
cp .env.example .env
# Edit .env: add GROQ_API_KEY, GOOGLE_API_KEY, and optionally SUPABASE_URL/KEY
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# 4. Database setup (optional — app runs in stateless mode without it)
# Paste contents of supabase_schema.sql into Supabase SQL editor

# 5. Run backend
uvicorn main:app --reload --port 8000

# Expected output:
# DatabaseManager: Running in Stateless Mode. (without Supabase creds)
# INFO: Uvicorn running on http://0.0.0.0:8000

# 6. Frontend setup (new terminal)
cd ../frontend
cp .env.local.example .env.local
# Edit .env.local: add Supabase keys if using auth
npm install
npm run dev

# Expected output:
# ▲ Next.js 16.1.1
# - Local: http://localhost:3000

# 7. Run tests
cd backend
python -m pytest tests/verify_fix.py -v
python tests/test_flow.py  # Integration tests (requires running backend)

# 8. Verify key endpoints
curl http://localhost:8000/
# → {"status":"active","mode":"stateful_agent"}

curl http://localhost:8000/api/audit/torvalds
# → {"username":"torvalds","trust_score":100,...}
```

---

## 12. Key decisions that need to be made

**State persistence strategy for multi-user scale**: Currently `MemorySaver` stores all session state in-memory. For multi-instance deployments, this means session state is lost on restart or across pods. Options: (A) Accept stateless mode for production and use only Supabase DB logs for history reconstruction (simpler, no extra dep); (B) Use `SqliteSaver` from LangGraph for single-server persistence; (C) Use Redis checkpointer (complex, but horizontally scalable). Recommendation: Ship B (SqliteSaver) now for demo quality, document C as a production upgrade path.

**Should `red_team.py` be wired into the interview graph?**: It adds a third AI call per turn (already doing Shadow Auditor + Lead Interviewer). This increases latency. Options: (A) Wire it in as a third node between shadow_auditor and code_sandbox; (B) Run it in parallel with shadow_auditor (LangGraph supports this); (C) Keep it as a standalone function callable from the `/api/audit/{username}` endpoint for one-shot analysis. Recommendation: Option C for now — surface it via the dashboard as "Code Review" mode.

**Public Skill Passport trust model**: The passport uses SHA-256 of DB record IDs as "verification hashes" and presents them as crypto-like proof. This is decorative — the hashes don't actually verify anything cryptographically since the same DB can be edited. Decision: (A) Keep as-is (the visual impression is enough for a portfolio project); (B) Add Supabase edge function that generates HMAC signatures using a server-side secret (real but complex); (C) Be honest in the UI that these are internal consistency hashes, not external cryptographic proofs. Recommendation: Option C + A. Add a tooltip explaining the trust model honestly.

**Demand Analyzer search queries hardcode "2024 2025"**: The queries will return increasingly stale results. Decision: (A) Use `datetime.now().year` dynamically; (B) Add a date parameter to the endpoint. Recommendation: Option A is a one-line fix.

**Background worker deployment**: The current `background_worker.py` uses `while True: ... time.sleep(3600)`. In production this is fragile (no retry, no monitoring). Decision: (A) Keep simple loop, document as `python background_worker.py &`; (B) Add `APScheduler` for cron-style execution with catch/retry; (C) Use Supabase Edge Functions for serverless scheduling. Recommendation: Option B for a serious demo — it's a 20-line change.

---

## 13. What would make this genuinely impressive

**Live deployed demo** — A Vercel frontend + Railway/Render backend with real API keys, publicly accessible without signup, would let anyone try the voice interview or challenge generator right from the README. This alone would 5x the stars. The zero-cost infrastructure thesis means this could be hosted on free tiers.

**Real benchmark numbers** — Run the GitHub Auditor on 50 known "AI-slop" accounts vs 50 known genuine contributors. Measure whether the trust score correctly separates them. Publish the confusion matrix. This transforms the project from "clever idea" to "measurable system."

**Commit entropy analysis actually implemented in the auditor** — The README claims the auditor "scans GitHub repositories for commit entropy to detect AI-generated code slop." The code doesn't actually do this — it only scores based on account age, push count, and repo count. Implementing actual diff-entropy analysis (measure character-level entropy of commit diffs, flag suspiciously uniform patches) would make the trust model real.

**Voice stress analysis beyond text features** — The current confidence score is computed from transcribed text (filler word counts). Real signal comes from audio features (pitch variance, pause duration, speech rate). Using `librosa` for audio feature extraction before Whisper transcription would make the vibe analysis genuinely novel.

**Skill Passport as a shareable URL** — `/candidate/torvalds` already exists as a route. If this page loaded real passport data and was publicly accessible, candidates could add `careerforge.ai/candidate/your-github-username` to their resume. That would create organic growth, cross the product from "tool" to "credential," and make the repo genuinely useful.

**A documented comparison to existing ATS tools** — Show that the challenge-based verification catches AI-generated portfolios that fool keyword-matching ATS systems. A single well-documented example (fake GitHub profile vs. real one, both submitted, showing how the Gauntlet differentiates them) would be cited and shared.

---

## 14. Star-worthiness checklist

### Must-have (project is not shareable without these)
- [ ] Runs end-to-end without crashing from a fresh clone — **BLOCKED by requirements.txt syntax error and missing pypdf**
- [ ] README explains what the project does in the first paragraph — **DONE** (good narrative)
- [ ] Setup is achievable in under 5 commands — **MISSING** (no setup guide in README)
- [ ] At least one concrete result, output, or demo is shown — **MISSING** (no screenshots or sample outputs)
- [x] No hardcoded absolute paths, API keys, or secrets in code — **CLEAN**
- [ ] requirements.txt is complete and pinned — **BROKEN** (syntax error, missing deps, no pins)
- [ ] LICENSE file is present — **MISSING**

### Should-have (separates good repos from great ones)
- [x] Architecture diagram or visual in README — **DONE** (5-engine description, but no diagram image)
- [ ] Results table with numbers — **MISSING**
- [ ] At least one working example script or notebook — **PARTIAL** (`test_flow.py` and standalone `if __name__ == "__main__"` blocks exist but aren't documented)
- [ ] Reproducible results (fixed random seeds, config files) — **MISSING** (LLM temperature is set but no seeding)
- [ ] Proper logging instead of print statements — **MISSING** (all print() everywhere)
- [x] Meaningful error messages and exception handling — **DONE** (most modules have try/except with fallbacks)
- [ ] Type hints on all public functions — **PARTIAL** (Pydantic models are good; function signatures lack return types)
- [ ] Docstrings on all public classes and functions — **PARTIAL** (most functions have docstrings; some are thin)
- [x] .gitignore covers all generated files and secrets — **DONE** (covers .env, __pycache__, temp_*.pdf)

### Nice-to-have (makes it genuinely star-worthy)
- [ ] Demo GIF or video in README — **MISSING** (highest impact item)
- [ ] Docker / docker-compose for one-command setup — **MISSING**
- [ ] GitHub Actions CI running tests on every push — **MISSING** (badge claims "passing" but no CI)
- [ ] Comparison to baseline or SOTA method — **MISSING**
- [ ] Contribution guide (CONTRIBUTING.md) — **MISSING**
- [ ] Changelog (CHANGELOG.md) — **MISSING**
- [ ] Pre-commit hooks for formatting and linting — **MISSING**
- [ ] Model card or data card — **N/A** (no trained models, inference only)
- [ ] Interactive demo (Gradio, Streamlit, or hosted link) — **MISSING** (the Next.js app *is* the demo, but no deployed link)
- [ ] Paper or blog post link — **MISSING** (would benefit from a dev.to or Substack post explaining the trust crisis thesis)
