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
// ... (Keep existing code above)

// 3. Upload Resume
export interface ResumeAnalysis {
  filename: string;
  analysis: string; // The raw string from the AI (JSON-like)
}

export const uploadResume = async (file: File): Promise<ResumeAnalysis> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/resume/upload`, {
    method: "POST",
    body: formData, // No Content-Type header needed (browser sets it automatically for FormData)
  });

  if (!res.ok) throw new Error("Failed to upload resume");
  return res.json();
};