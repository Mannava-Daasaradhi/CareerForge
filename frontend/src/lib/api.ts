// frontend/src/lib/api.ts

const API_BASE = "http://localhost:8000/api";

export interface Message {
  role: "user" | "ai";
  content: string;
}

export interface AuditResult {
  username: string;
  trust_score: number;
  verdict: string;
  account_age_years: number;
  recent_pushes: number;
}

// 1. Audit User (Get Trust Score)
export const auditUser = async (username: string): Promise<AuditResult> => {
  const res = await fetch(`${API_BASE}/audit/${username}`);
  if (!res.ok) throw new Error("Failed to audit user");
  return res.json();
};

// 2. Chat (Interview)
export const sendChatMessage = async (
  message: string, 
  history: Message[], 
  topic: string = "General Engineering"
) => {
  const res = await fetch(`${API_BASE}/interview/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history,
      topic,
      difficulty: 75 // Default starting difficulty
    }),
  });
  
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
};