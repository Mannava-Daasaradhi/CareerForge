// frontend/src/lib/api.ts

const API_BASE = "http://localhost:8000/api";

export interface Message {
  role: "user" | "ai";
  content: string;
}

export interface ChatResponse {
  reply: string;
  critique: string;
  session_id: string;
  sanitized_message: string;
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
): Promise<ChatResponse> => {
  const res = await fetch(`${API_BASE}/interview/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history,
      topic,
      difficulty: 50 // Default
    }),
  });
  
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
};

// 3. Upload Resume
export interface ResumeAnalysis {
  filename: string;
  analysis: string; 
}

export const uploadResume = async (file: File): Promise<ResumeAnalysis> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/resume/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload resume");
  return res.json();
};