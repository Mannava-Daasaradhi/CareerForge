[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)](https://github.com/mannava-daasaradhi/careerforge)
[![Stack](https://img.shields.io/badge/Stack-Next.js_16_%7C_FastAPI_%7C_LangGraph-blue?style=for-the-badge)](https://nextjs.org/)
[![AI Models](https://img.shields.io/badge/AI-Llama_3.3_%7C_Gemini_1.5-purple?style=for-the-badge)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br />
<div align="center">
  <a href="https://github.com/mannava-daasaradhi/careerforge">
    <img src="frontend/public/globe.svg" alt="CareerForge Logo" width="80" height="80">
  </a>

  <h1 align="center">CareerForge</h1>

  <p align="center">
    <strong>The Trust-Based Agentic Career OS</strong>
    <br />
    <em>Solving "Vibecoding" through Universal Adversarial Testing & Autonomous Agents.</em>
    <br />
    <br />
    <a href="#demo">View Demo</a>
    ·
    <a href="#architecture">Architecture</a>
    ·
    <a href="#getting-started">Setup Guide</a>
  </p>
</div>

---

## 📖 Executive Summary

**CareerForge** is not just a job board or a resume builder—it is an **Agentic Operating System** designed to bridge the trust gap in the AI era. 

As candidates increasingly use AI to fake skills ("Vibecoding"), traditional hiring signals have collapsed. CareerForge rebuilds trust by deploying a **5-Engine Architecture** that validates skills through adversarial testing, automates networking via digital twins, and manages the entire career lifecycle using a Supervisor-Worker agent swarm.

**Key Differentiator:** We run on a **Zero-Cost Infrastructure**, leveraging high-tier free plans (Groq, Gemini Flash, Supabase) to deliver enterprise-grade AI orchestration without the enterprise price tag.

---

## 🏗 System Architecture

The system follows a **Service-Oriented Agent Architecture (SOAA)** split between a Next.js 16 frontend and a FastAPI Agent Gateway.

### The 5-Engine Core (Backend)

1.  **🛡️ The Secure Airlock (Ingestion)**
    * **Tech:** `Presidio`, `Gemini Vision`, `PDF2Image`
    * **Function:** Rasterizes PDFs to neutralize prompt injection, redacts PII (Names, Phones, Emails) using Microsoft Presidio, and extracts semantic data via Vision models.

2.  **⚔️ The Universal Gauntlet (Verification)**
    * **Tech:** `GitHubAuditor`, `CodeSandbox (Piston)`, `Gemini 1.5`
    * **Function:**
        * **Contextual Audit:** Scans GitHub repositories for commit entropy to detect AI-generated code slop.
        * **Cursed Sandbox:** Generates broken code based on a candidate's specific claims and verifies their fixes via safe, sandboxed execution.

3.  **🗣️ The Adaptive Interrogation Engine**
    * **Tech:** `VoiceProcessor` (Whisper), `LangGraph`, `Elo-Scoring`
    * **Function:** A stateful voice interview system that detects nervousness (confidence metrics), critiques answers in real-time, and dynamically adjusts difficulty.

4.  **👻 The Ghost Tech Lead (Upskilling)**
    * **Tech:** `RoadmapGenerator`, `TDD-Agent`
    * **Function:** Breaks "Tutorial Hell" by generating Test-Driven Development challenges that force candidates to write passing code for real-world scenarios.

5.  **🎯 The Sniper (Outreach)**
    * **Tech:** `Negotiator`, `NetworkingAgent`, `AB_Tester`
    * **Function:** Generates cold outreach, simulates salary negotiations, and runs A/B tests on resume variations against live market data.

---

## 🧩 Tech Stack

### Frontend (Client)
* **Framework:** Next.js 16.1 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS + PostCSS
* **State/Auth:** Supabase Auth Helpers
* **UI Components:** Framer Motion, React Confetti

### Backend (Server & Agents)
* **API Gateway:** FastAPI (Python 3.10+)
* **Orchestration:** LangChain & LangGraph (Stateful Multi-Agent Graphs)
* **Inference:**
    * **Logic:** Groq API (Llama 3.3 70B) for sub-second latency.
    * **Context:** Google Gemini 1.5 Flash (1M Token Window) for deep document analysis.
* **Database:** Supabase (PostgreSQL + pgvector for semantic search).
* **Security:** Presidio Analyzer & Anonymizer.
* **Sandboxing:** Piston API (Remote Code Execution).

---

## 📂 Repository Structure

```text
├── backend/
│   ├── agents/               # Individual Agent Logic
│   │   ├── ab_tester.py      # Resume A/B Testing
│   │   ├── auditor.py        # GitHub Trust Scoring
│   │   ├── negotiator.py     # Salary Negotiation Sim
│   │   └── red_team.py       # Adversarial Testing
│   ├── main.py               # FastAPI Entrypoint & Routes
│   ├── graph.py              # LangGraph Orchestration Logic
│   ├── database.py           # Supabase Connection
│   └── requirements.txt      # Python Dependencies
│
├── frontend/
│   ├── src/app/              # Next.js 16 App Router Pages
│   │   ├── interview/        # Voice/Chat Interview UI
│   │   ├── kanban/           # Job Application Tracker
│   │   └── dashboard/        # Candidate Metrics
│   ├── public/               # Static Assets
│   └── package.json          # Node Dependencies