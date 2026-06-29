export interface MatchedSkill {
  skill: string;
  evidence: string; // where/how it shows up in the resume
}

export interface MissingSkill {
  skill: string;
  importance: "critical" | "important" | "nice-to-have";
  howToClose: string; // concrete advice: experience to get, or how to surface it if they have it
}

export interface RewriteSuggestion {
  section: string; // e.g. "Experience — Acme Corp", "Summary"
  original: string;
  rewritten: string;
  reason: string;
}

export interface AnalysisResult {
  matchScore: number; // 0-100
  verdict: string; // one-line plain-English verdict
  summary: string; // 2-3 sentence overview
  matchedSkills: MatchedSkill[];
  missingSkills: MissingSkill[];
  rewriteSuggestions: RewriteSuggestion[];
}

export interface AnalyzeErrorResponse {
  error: string;
}
