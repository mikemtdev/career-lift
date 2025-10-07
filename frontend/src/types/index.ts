export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  summary?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current?: boolean;
}

export interface CV {
  id: string;
  userId: string;
  title: string;
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: string[];
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CVFormData {
  title: string;
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: string[];
}

export interface ATSScoreResult {
  score: number;
  suggestions: string[];
  breakdown: {
    personalInfo: number;
    education: number;
    experience: number;
    skills: number;
    formatting: number;
  };
}
export interface AdminStats {
  totalUsers: number;
  totalCvs: number;
  freeCvs: number;
  paidCvs: number;
}

export interface Pricing {
  id?: string;
  additionalCvPrice: number; // price in cents
  createdAt?: string;
  updatedAt?: string;
}
