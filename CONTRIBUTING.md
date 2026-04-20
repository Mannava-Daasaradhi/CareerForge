# Contributing to CareerForge

Thanks for your interest in contributing. This document explains the project structure and the exact steps to add new capabilities — whether that's a new agent, a new LangGraph node, or a new frontend page.

---

## Project overview

CareerForge has two independently deployable halves:

- **`backend/`** — FastAPI + LangGraph. All AI agents live here as Python modules. The interview workflow is a stateful LangGraph graph; other agents (auditor, negotiator, etc.) are standalone async functions exposed as FastAPI routes.
- **`frontend/`** — Next.js 16 App Router + Supabase auth. All API calls go through `src/lib/api.ts`. Pages live under `src/app/`.

---

## Setting up for development

```powershell
# Clone and enter the repo
git clone https://github.com/Mannava-Daasaradhi/CareerForge.git
Set-Location CareerForge

# Backend
Set-Location backend
Copy-Item .env.example .env
# Edit .env: add GROQ_API_KEY and GOOGLE_API_KEY
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
Set-Location ..\frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

Run the existing test suite before making changes:

```powershell
Set-Location backend
python -m pytest tests/verify_fix.py -v
```

---

## How to add a new backend agent

Every agent in CareerForge is a Python module in `backend/`. There are two kinds:

### Kind A — Standalone agent (exposed directly as an API route)

Examples: `negotiator.py`, `networking_agent.py`, `auditor.py`

**Steps:**

1. **Create `backend/your_agent.py`**

```python
# backend/your_agent.py
from logger import get_logger
from pydantic import BaseModel

logger = get_logger(__name__)

class YourAgentResult(BaseModel):
    output: str
    confidence: float

async def run_your_agent(input_data: str) -> YourAgentResult:
    """
    One-sentence description of what this agent does.
    """
    logger.info("Running YourAgent for input: %s", input_data[:50])
    # ... your LLM call here ...
    return YourAgentResult(output="...", confidence=0.9)
```

2. **Add the route to `backend/main.py`**

```python
from your_agent import run_your_agent, YourAgentResult

class YourAgentRequest(BaseModel):
    input_data: str

@app.post("/api/your-agent/run")
async def your_agent_endpoint(
    request: YourAgentRequest,
    user_id: str = Depends(get_current_user)
):
    return await run_your_agent(request.input_data)
```

3. **Add a typed wrapper to `frontend/src/lib/api.ts`**

```typescript
export interface YourAgentResult {
  output: string;
  confidence: number;
}

export async function callYourAgent(inputData: string): Promise<YourAgentResult> {
  const res = await fetch(`${API_BASE}/your-agent/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input_data: inputData }),
  });
  if (!res.ok) throw new Error(`YourAgent failed: ${res.status}`);
  return res.json();
}
```

---

### Kind B — LangGraph node (wired into the interview graph)

Examples: `interviewer.py`, `shadow_auditor.py`, `burnout_guard.py`

**Steps:**

1. **Add any new state fields to `backend/agent_state.py`**

```python
class InterviewState(TypedDict):
    # ... existing fields ...
    your_new_field: Optional[str]   # add here
```

2. **Create `backend/your_node.py`**

```python
# backend/your_node.py
from agent_state import InterviewState
from logger import get_logger

logger = get_logger(__name__)

def your_node(state: InterviewState) -> dict:
    """
    Reads from state, does something, returns a dict of state updates.
    Never mutate state directly — always return a new dict.
    """
    messages = state.get("messages", [])
    # ... your logic here ...
    logger.info("YourNode processed %d messages", len(messages))
    return {
        "your_new_field": "result"
    }
```

3. **Wire it into `backend/graph.py`**

```python
from your_node import your_node

# Add the node
workflow.add_node("your_node", your_node)

# Add an edge — after shadow_auditor, before code_sandbox for example:
workflow.add_edge("shadow_auditor", "your_node")
workflow.add_edge("your_node", "code_sandbox")
```

**Important rules for LangGraph nodes:**
- Node functions receive the full state dict and must return a **partial dict** of only the fields they update
- Router functions (like `burnout_router`) return a **string** node name — they cannot update state
- If a node needs to both route and update state, use a node + a conditional edge, not a router that tries to do both

---

## How to add a new frontend page

All pages live under `frontend/src/app/`. Next.js App Router conventions apply.

**Steps:**

1. **Create `frontend/src/app/your-page/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { callYourAgent } from "@/lib/api";

export default function YourPage() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const data = await callYourAgent("example input");
      setResult(data.output);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Your Feature</h1>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Running..." : "Run"}
      </button>
      {result && <pre>{result}</pre>}
    </main>
  );
}
```

2. **Add a Navbar link in `frontend/src/components/Navbar.tsx`** if the page is a primary feature.

---

## Coding standards

**Backend:**
- Use `from logger import get_logger; logger = get_logger(__name__)` — no raw `print()` calls
- All public functions must have a one-line docstring
- Pydantic models for all request/response bodies
- Wrap all LLM calls in `try/except` with a sensible fallback return value
- Use `Optional[str]` not `str | None` (keeps Python 3.10 compat)

**Frontend:**
- All API calls go through `src/lib/api.ts` — no inline `fetch()` calls in page components
- Use TypeScript interfaces for all API response shapes
- Handle loading and error states on every async operation

---

## Submitting a pull request

1. Fork the repo and create a branch: `git checkout -b feat/your-feature-name`
2. Make your changes following the standards above
3. Run the test suite: `python -m pytest backend/tests/verify_fix.py -v`
4. Verify the frontend builds: `cd frontend && npm run build`
5. Open a PR with a clear description of what the agent does and why it belongs in CareerForge

---

## Questions?

Open a GitHub Issue with the `question` label.
