// FILE: frontend/src/lib/api.ts

// --- Types ---
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

// RESTORED: This was missing and causing your error
export interface AuditResult {
  username: string;
  trust_score: number;
  verdict: string;
  account_age_years: number;
  recent_pushes: number;
}

// --- TELEMETRY STATE ---
let startTime = 0;
let keystrokes = 0;

export const startTelemetry = () => {
  startTime = Date.now();
  keystrokes = 0;
};

export const trackKeystroke = () => {
  keystrokes++;
};

// --- API FUNCTIONS ---

// 1. CHAT FUNCTION (For Interview Page)
export async function sendChatMessage(
  message: string, 
  history: Message[],
  sessionId?: string
): Promise<ChatResponse> {
  
  const endTime = Date.now();
  const timeTaken = endTime - startTime;
  
  // Logic: Calculate "Keystrokes per Second"
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

  if (!res.ok) throw new Error("Failed to fetch chat response");
  
  return res.json();
}

// 2. RESUME UPLOAD FUNCTION
export async function uploadResume(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:8000/api/resume/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Resume upload failed");
  return res.json();
}

// 3. GITHUB AUDIT FUNCTION (RESTORED - CRITICAL FOR HOME PAGE)
export async function auditUser(username: string): Promise<AuditResult> {
  const res = await fetch(`http://localhost:8000/api/audit/${username}`);
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Audit failed");
  }
  
  return res.json();
}