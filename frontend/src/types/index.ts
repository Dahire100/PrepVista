// Core types for the application
export interface User {
  id: string;
  name: string;
  email: string;
  university?: string;
  course?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface ResumeAnalysis {
  id: string;
  userId: string;
  atsScore: number;
  overallRating: 'A' | 'B' | 'C' | 'D' | 'F';
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  createdAt: string;
}

export interface VideoAnalysis {
  id: string;
  userId: string;
  videoUrl: string;
  eyeContactPercentage: number;
  postureScore: number;
  gestureAnalysis: string;
  emotionalAnalysis: string;
  speechQuality: number;
  confidence: number;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  type: 'technical' | 'hr' | 'behavioral';
  duration: number;
  score: number;
  feedback: string[];
  createdAt: string;
}

export interface DashboardStats {
  resumeScore: number;
  interviewCount: number;
  successRate: number;
  totalSessions: number;
  improvement: number;
}

// Add to your existing types
export interface BackendUser {
  _id: string;
  email: string;
  full_name: string;
  profile?: {
    phone?: string;
    linkedin?: string;
    location?: string;
  };
  subscription: {
    plan: string;
    analyses_used: number;
    analyses_limit: number;
  };
}

// Keep your existing User interface and add mapping function
export const mapBackendUserToUser = (backendUser: BackendUser): User => {
  return {
    id: backendUser._id,
    name: backendUser.full_name,
    email: backendUser.email,
    university: '', // You can add this to backend later
    course: '', // You can add this to backend later
    createdAt: new Date().toISOString()
  };
};