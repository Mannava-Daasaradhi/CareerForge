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
  vibe_metrics?: {
    confidence_score: number;
    clarity_score: number;
  };
}

export interface AuditResult {
  username: string;
  trust_score: number;
  verdict: string;
  account_age_years: number;
  recent_pushes: number;
}

// --- 1. Audit User ---
export const auditUser = async (username: string): Promise<AuditResult> => {
  const res = await fetch(`${API_BASE}/audit/${username}`);
  if (!res.ok) throw new Error("Failed to audit user");
  return res.json();
};

// --- 2. Chat (Interview) ---
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

// --- 3. Resume Operations ---
export interface ResumeAnalysis {
  filename: string;
  analysis: any; // Flexible JSON from LLM
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

// --- 4. Resume Tailor (NEW) ---
export interface TailoredSection {
  section_name: string;
  original_content: string;
  tailored_content: string;
  reasoning: string;
}

export interface TailoredResume {
  job_role_analysis: string;
  sections: TailoredSection[];
  email_cover_letter_draft: string;
}

export const tailorResume = async (file: File, jobDescription: string): Promise<TailoredResume> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription);

  const res = await fetch(`${API_BASE}/resume/tailor`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to tailor resume");
  return res.json();
};

// --- 5. Job Hunter (NEW) ---
export interface JobOpportunity {
  role_title: string;
  company: string;
  match_score: number;
  why_good_fit: string;
  cautionary_warning?: string;
  apply_link_guess: string;
}

export interface JobHuntReport {
  opportunities: JobOpportunity[];
  strategic_advice: string;
}

export const huntJobs = async (target_role: string, location: string = "Remote", skill_gaps: string[] = []): Promise<JobHuntReport> => {
  const res = await fetch(`${API_BASE}/career/hunt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_role, location, current_skill_gaps: skill_gaps }),
  });
  if (!res.ok) throw new Error("Failed to hunt jobs");
  return res.json();
};

// --- 6. Skill Passport (NEW) ---
export interface VerifiedChallenge {
  challenge_title: string;
  status: string;
  timestamp: string;
  verification_hash: string;
}

export interface SkillPassport {
  candidate_id: string;
  generated_at: string;
  github_trust_score: number;
  interview_readiness_score: number;
  verified_skills: string[];
  recent_achievements: VerifiedChallenge[];
  passport_signature: string;
}

export const getPassport = async (username: string): Promise<SkillPassport> => {
  const res = await fetch(`${API_BASE}/passport/${username}`);
  if (!res.ok) throw new Error("Failed to fetch passport");
  return res.json();
};