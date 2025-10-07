export interface ATSScoreResult {
  score: number; // 0-100
  suggestions: string[];
  breakdown: {
    personalInfo: number;
    education: number;
    experience: number;
    skills: number;
    formatting: number;
  };
}

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  summary?: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current?: boolean;
}

interface CVData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: string[];
}

export function calculateATSScore(cvData: CVData): ATSScoreResult {
  const suggestions: string[] = [];
  const breakdown = {
    personalInfo: 0,
    education: 0,
    experience: 0,
    skills: 0,
    formatting: 0,
  };

  // Personal Info Score (max 20 points)
  let personalInfoScore = 0;
  const { personalInfo } = cvData;

  if (personalInfo.fullName && personalInfo.fullName.length > 0) {
    personalInfoScore += 5;
  } else {
    suggestions.push('Add your full name to improve ATS compatibility');
  }

  if (personalInfo.email && personalInfo.email.includes('@')) {
    personalInfoScore += 5;
  } else {
    suggestions.push('Add a valid email address');
  }

  if (personalInfo.phone && personalInfo.phone.length >= 10) {
    personalInfoScore += 5;
  } else {
    suggestions.push('Add a complete phone number');
  }

  if (personalInfo.summary && personalInfo.summary.length >= 50) {
    personalInfoScore += 5;
  } else if (personalInfo.summary && personalInfo.summary.length > 0) {
    personalInfoScore += 2;
    suggestions.push('Expand your professional summary to at least 50 characters for better impact');
  } else {
    suggestions.push('Add a professional summary to highlight your key qualifications');
  }

  breakdown.personalInfo = personalInfoScore;

  // Education Score (max 20 points)
  let educationScore = 0;
  const { education } = cvData;

  if (education.length === 0) {
    suggestions.push('Add at least one education entry');
  } else {
    educationScore += 10; // Has education entries

    let hasDescriptions = 0;
    let hasCompleteDates = 0;

    education.forEach((edu) => {
      if (edu.description && edu.description.length > 20) {
        hasDescriptions++;
      }
      if (edu.startDate && edu.endDate) {
        hasCompleteDates++;
      }
    });

    if (hasDescriptions > 0) {
      educationScore += 5;
    } else {
      suggestions.push('Add descriptions to your education entries to provide context');
    }

    if (hasCompleteDates === education.length) {
      educationScore += 5;
    } else {
      suggestions.push('Ensure all education entries have complete date ranges');
    }
  }

  breakdown.education = educationScore;

  // Experience Score (max 30 points)
  let experienceScore = 0;
  const { experience } = cvData;

  if (experience.length === 0) {
    suggestions.push('Add work experience to strengthen your CV');
  } else if (experience.length === 1) {
    experienceScore += 10;
    suggestions.push('Add more work experience entries to showcase your career progression');
  } else if (experience.length >= 2) {
    experienceScore += 15;
  }

  let experienceWithDescriptions = 0;
  let totalDescriptionLength = 0;

  experience.forEach((exp) => {
    if (exp.description && exp.description.length > 0) {
      experienceWithDescriptions++;
      totalDescriptionLength += exp.description.length;
    }
  });

  if (experienceWithDescriptions === experience.length && experience.length > 0) {
    experienceScore += 10;
  } else if (experienceWithDescriptions > 0) {
    experienceScore += 5;
    suggestions.push('Add detailed descriptions to all work experience entries');
  } else if (experience.length > 0) {
    suggestions.push('Add descriptions to your work experience to highlight your achievements and responsibilities');
  }

  // Bonus for detailed descriptions
  const avgDescriptionLength = experience.length > 0 ? totalDescriptionLength / experience.length : 0;
  if (avgDescriptionLength >= 100) {
    experienceScore += 5;
  } else if (experience.length > 0 && experienceWithDescriptions > 0) {
    suggestions.push('Expand work experience descriptions to at least 100 characters each for better detail');
  }

  breakdown.experience = experienceScore;

  // Skills Score (max 20 points)
  let skillsScore = 0;
  const { skills } = cvData;

  if (skills.length === 0) {
    suggestions.push('Add relevant skills to improve ATS matching');
  } else if (skills.length < 5) {
    skillsScore += 10;
    suggestions.push('Add more skills (aim for at least 5-10) to improve keyword matching');
  } else if (skills.length >= 5 && skills.length < 10) {
    skillsScore += 15;
    suggestions.push('Consider adding a few more skills to reach 10+ for optimal ATS performance');
  } else {
    skillsScore += 20;
  }

  breakdown.skills = skillsScore;

  // Formatting Score (max 10 points)
  let formattingScore = 10; // Start with perfect score
  const issues: string[] = [];

  // Check for very short entries
  if (personalInfo.summary && personalInfo.summary.length < 30) {
    formattingScore -= 2;
    issues.push('summary is too brief');
  }

  // Check for missing optional but important fields
  if (!personalInfo.address) {
    formattingScore -= 2;
    issues.push('missing address/location');
  }

  if (issues.length > 0) {
    suggestions.push(`Formatting improvements: ${issues.join(', ')}`);
  }

  breakdown.formatting = formattingScore;

  // Calculate total score
  const totalScore = Math.min(
    100,
    personalInfoScore + educationScore + experienceScore + skillsScore + formattingScore
  );

  // Add overall suggestions based on score
  if (totalScore < 50) {
    suggestions.unshift('Your CV needs significant improvement. Focus on completing all sections with detailed information.');
  } else if (totalScore < 70) {
    suggestions.unshift('Your CV is on the right track. Address the suggestions below to improve your ATS score.');
  } else if (totalScore < 85) {
    suggestions.unshift('Good CV! A few improvements will make it excellent for ATS systems.');
  } else {
    suggestions.unshift('Excellent CV! Your CV is well-optimized for ATS systems.');
  }

  return {
    score: totalScore,
    suggestions,
    breakdown,
  };
}
