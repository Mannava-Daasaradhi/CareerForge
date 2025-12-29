# CareerForge: The Trust-Based Agentic Career OS

**Status:** Pre-Alpha | **Architecture:** Zero-Cost, Security-First

## 1. Executive Vision
CareerForge is designed to solve "Vibecoding"—the market flood of candidates using AI to fake skills. We do not just read resumes; we verify skills via **Universal Adversarial Testing**. 

The system runs on a **$0 cost infrastructure** using high-tier free plans and open-source libraries.

## 2. The Tech Stack (Zero-Cost)
* **Orchestration:** LangGraph (Python) - Supervisor/Worker pattern.
* **Inference:** Groq API (Llama 3.3 70B) for logic/speed.
* **Deep Context:** Google Gemini 1.5 Flash (1M token window) for audits.
* **Database:** Supabase (PostgreSQL + pgvector).
* **Execution:** Piston API (Sandboxed Code Execution).
* **Security:** Microsoft Presidio (PII Redaction).
* **Frontend:** Next.js (App Router) + ShadcnUI + React Flow.

## 3. The 5-Engine Architecture
1.  **The Secure Ingestion "Airlock":** Rasterizes PDFs to kill prompt injection, sanitizes PII, and extracts data via Gemini Vision.
2.  **The "Universal Gauntlet":** * *Contextual Audit:* Scans GitHub for commit entropy.
    * *Cursed Sandbox:* Generates broken code based on claimed skills.
    * *Socratic Defense:* AI interrogates the user on their specific code fix.
3.  **The Adaptive Interrogation Engine:** Multi-agent interview (Lead + Shadow Auditor + Pivot) with Elo-style difficulty scaling.
4.  **The "Ghost Tech Lead":** TDD-based learning environment using failing tests to break "Tutorial Hell."
5.  **The "Sniper" Outreach:** Generates A/B resumes and cold DMs based on live market news.

## 4. Setup & Installation
*(Coming Soon - Phase 1 Implementation)*

## 5. License
MIT