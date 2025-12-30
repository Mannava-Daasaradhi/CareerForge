// frontend/src/lib/api.ts

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (For Auth Management on Frontend)
// We use environmental variables if available, otherwise rely on local storage access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabase = createClient(supabaseUrl, supabaseKey);

const API_BASE = "http://localhost:8000/api";

// --- SECURITY HELPER ---
const getAuthHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  
  if (!token) {
    console.warn("⚠️ No Auth Token found. API requests may fail.");
    return {};
  }
  return { "Authorization": `Bearer ${token}` };
};

export interface Message {
  role: "user" | "ai";
  content: string;
}

export interface ChatResponse {
  reply: string;
  critique: string;
  session_id: string;
  user_text_processed: string;
  vibe_metrics?: {
    confidence_score: number;
    clarity_score: number;
  };
}

// --- 1. Audit User (Standard & Deep) ---
export interface AuditResult {
  username: string;
  trust_score: number;
  verdict: string;
  account_age_years: number;
  recent_pushes: number;
}

export const auditUser = async (username: string): Promise<AuditResult> => {
  const res = await fetch(`${API_BASE}/audit/${username}`, {
    headers: { ...(await getAuthHeaders()) }
  });
  if (!res.ok) throw new Error("Failed to audit user");
  return res.json();
};

export const deepAudit = async (username: string): Promise<any> => {
  const res = await fetch(`${API_BASE}/audit/deep/${username}`, {
    headers: { ...(await getAuthHeaders()) }
  });
  if (!res.ok) throw new Error("Failed to perform deep audit");
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
    headers: { 
        "Content-Type": "application/json",
        ...(await getAuthHeaders()) 
    },
    body: JSON.stringify({
      message,
      history,
      topic,
      difficulty: 50
    }),
  });
  
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
};

// --- 3. Resume Tools (Tailor & Upload) ---
export interface ResumeAnalysis {
  filename: string;
  analysis: any;
}

export const uploadResume = async (file: File): Promise<ResumeAnalysis> => {
  const formData = new FormData();
  formData.append("file", file);

  // Note: We do NOT set Content-Type for FormData; browser does it.
  // But we MUST attach the Authorization header.
  const auth = await getAuthHeaders();
  
  const res = await fetch(`${API_BASE}/resume/upload`, {
    method: "POST",
    headers: { ...auth }, 
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload resume");
  return res.json();
};

export interface TailoredResume {
  job_role_analysis: string;
  sections: Array<{
    section_name: string;
    original_content: string;
    tailored_content: string;
    reasoning: string;
  }>;
  email_cover_letter_draft: string;
}

export const tailorResume = async (file: File, jobDescription: string): Promise<TailoredResume> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription);

  const auth = await getAuthHeaders();

  const res = await fetch(`${API_BASE}/resume/tailor`, {
    method: "POST",
    headers: { ...auth },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to tailor resume");
  return res.json();
};

// --- 4. Market & Jobs ---
export const huntJobs = async (target_role: string, location: string = "Remote", skill_gaps: string[] = []): Promise<any> => {
  const res = await fetch(`${API_BASE}/career/hunt`, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        ...(await getAuthHeaders())
    },
    body: JSON.stringify({ target_role, location, current_skill_gaps: skill_gaps }),
  });
  if (!res.ok) throw new Error("Failed to hunt jobs");
  return res.json();
};

export const getMarketDemand = async (role: string, location: string = "Global"): Promise<any> => {
  const res = await fetch(`${API_BASE}/career/demand`, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        ...(await getAuthHeaders())
    },
    body: JSON.stringify({ role, location }),
  });
  if (!res.ok) throw new Error("Failed to fetch market demand");
  return res.json();
};

// --- 5. Kanban (Mission Control) ---
export interface Application {
  id?: string;
  role_title: string;
  company_name: string;
  status: "Wishlist" | "Applied" | "Interview" | "Offer" | "Rejected" | "Todo";
  salary_range?: string;
  notes?: string;
}

export const getApplications = async (): Promise<Application[]> => {
  const res = await fetch(`${API_BASE}/kanban/list`, {
    headers: { ...(await getAuthHeaders()) }
  });
  if (!res.ok) return []; 
  return res.json();
};

export const addApplication = async (app: Application): Promise<any> => {
  const res = await fetch(`${API_BASE}/kanban/add`, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        ...(await getAuthHeaders())
    },
    body: JSON.stringify(app),
  });
  if (!res.ok) throw new Error("Failed to add application");
  return res.json();
};

export const updateApplicationStatus = async (id: string, status: string, feedback: string = ""): Promise<any> => {
  const res = await fetch(`${API_BASE}/kanban/update`, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        ...(await getAuthHeaders())
    },
    body: JSON.stringify({ id, status, feedback }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
};

// --- 6. Passport & Challenges ---
export const getPassport = async (username: string): Promise<any> => {
  const res = await fetch(`${API_BASE}/passport/${username}`, {
    headers: { ...(await getAuthHeaders()) }
  });
  if (!res.ok) throw new Error("Failed to fetch passport");
  return res.json();
};

export const generateChallenge = async (topic: string, difficulty: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/challenge/new`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...(await getAuthHeaders())
        },
        body: JSON.stringify({ topic, difficulty })
    });
    return res.json();
};

export const verifyChallenge = async (user_code: string, test_cases: any[]): Promise<any> => {
    const res = await fetch(`${API_BASE}/challenge/verify`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...(await getAuthHeaders())
        },
        body: JSON.stringify({ user_code, language: "python", test_cases })
    });
    return res.json();
};

// --- 7. Networking & Recruiter ---
export const generateOutreach = async (params: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/network/generate`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...(await getAuthHeaders())
        },
        body: JSON.stringify(params)
    });
    return res.json();
};

export const askDigitalTwin = async (username: string, question: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/recruiter/ask`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...(await getAuthHeaders())
        },
        body: JSON.stringify({ username, question })
    });
    return res.json();
};