// FILE: frontend/src/lib/api.ts

export interface Message {
  role: "user" | "ai";
  content: string;
}

export interface ChatResponse {
  reply: string;
  trust_score: number;
  red_team_flag: string;
  pivot_triggered: boolean;
  difficulty: string;
  session_id: string;
}

export interface AuditResult {
  username: string;
  trust_score: number;
  verdict: string;
  account_age_years: number;
  recent_pushes: number;
}

// --- TELEMETRY ---
let startTime = 0;
let keystrokes = 0;

export const startTelemetry = () => {
  startTime = Date.now();
  keystrokes = 0;
};

export const trackKeystroke = () => {
  keystrokes++;
};

// --- API CALLS ---

// 1. CHAT (Interview)
export async function sendChatMessage(
  message: string, 
  history: Message[],
  sessionId?: string
): Promise<ChatResponse> {
  const timeTaken = Date.now() - startTime;
  const velocity = timeTaken > 0 ? (keystrokes / (timeTaken / 1000)) : 0;
  const isPaste = message.length > 30 && keystrokes < 5;

  const res = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history, 
      session_id: sessionId,
      keystroke_velocity: velocity,
      paste_detected: isPaste,
      time_taken_ms: timeTaken
    }),
  });

  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}

// 2. RESUME (Sentinel)
export async function uploadResume(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("http://localhost:8000/api/resume/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

// 3. AUDIT (GitHub)
export async function auditUser(username: string): Promise<AuditResult> {
  const res = await fetch(`http://localhost:8000/api/audit/${username}`);
  if (!res.ok) throw new Error("Audit failed");
  return res.json();
}