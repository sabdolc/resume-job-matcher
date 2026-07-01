import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult } from "./types";

const MODEL = "gemini-3.5-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your .env.local file."
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

const SYSTEM_PROMPT = `You are an expert technical recruiter and resume coach with 15 years of experience screening candidates for tech roles. You give direct, specific, actionable feedback — never vague platitudes.

You will be given a candidate's resume text and a job description. Analyze how well the resume matches the job and respond with ONLY a single valid JSON object — no markdown code fences, no preamble, no explanation outside the JSON.

The JSON must match this exact shape:

{
  "matchScore": <integer 0-100, your honest assessment of how qualified this candidate is for this specific role>,
  "verdict": "<one short plain-English sentence, e.g. 'Strong match — you meet most core requirements' or 'Significant gaps — focus on the must-haves below first'>",
  "summary": "<2-3 sentences giving an honest overview of the fit: biggest strengths and biggest concerns>",
  "matchedSkills": [
    { "skill": "<skill or requirement from the JD>", "evidence": "<short note on where/how this shows up in the resume>" }
  ],
  "missingSkills": [
    {
      "skill": "<skill or requirement from the JD the resume does not demonstrate>",
      "importance": "critical" | "important" | "nice-to-have",
      "howToClose": "<concrete, specific advice: either how to surface existing-but-unstated experience, or what experience/project/certification to go get>"
    }
  ],
  "rewriteSuggestions": [
    {
      "section": "<which resume section/bullet this refers to, e.g. 'Experience — Acme Corp, Backend Engineer'>",
      "original": "<the original line or a close paraphrase of it>",
      "rewritten": "<an improved version tailored to this job description>",
      "reason": "<one sentence on why this rewrite is stronger for this specific JD>"
    }
  ]
}

Guidelines:
- Be honest and calibrated with matchScore. Most real candidates score 40-85%. Reserve 90+ for near-perfect matches and below 30 for poor fits.
- List 4-8 matchedSkills and 3-7 missingSkills, ordered by importance.
- Provide 3-5 rewriteSuggestions focused on the highest-impact changes.
- Never fabricate experience the candidate doesn't have.
- Output ONLY the JSON object, nothing else.`;

function buildPrompt(resumeText: string, jobDescription: string): string {
  return `${SYSTEM_PROMPT}

JOB DESCRIPTION:
"""
${jobDescription}
"""

RESUME:
"""
${resumeText}
"""

Analyze the match and respond with the JSON object as specified.`;
}

function extractJson(raw: string): string {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }
  return text.trim();
}

function validateResult(parsed: unknown): AnalysisResult {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Analysis response was not a JSON object.");
  }
  const obj = parsed as Record<string, unknown>;
  if (typeof obj.matchScore !== "number") throw new Error("Missing matchScore.");
  if (typeof obj.verdict !== "string") throw new Error("Missing verdict.");
  if (typeof obj.summary !== "string") throw new Error("Missing summary.");
  if (!Array.isArray(obj.matchedSkills)) throw new Error("Missing matchedSkills.");
  if (!Array.isArray(obj.missingSkills)) throw new Error("Missing missingSkills.");
  if (!Array.isArray(obj.rewriteSuggestions)) throw new Error("Missing rewriteSuggestions.");

  return {
    matchScore: Math.max(0, Math.min(100, Math.round(obj.matchScore as number))),
    verdict: obj.verdict as string,
    summary: obj.summary as string,
    matchedSkills: obj.matchedSkills as AnalysisResult["matchedSkills"],
    missingSkills: obj.missingSkills as AnalysisResult["missingSkills"],
    rewriteSuggestions: obj.rewriteSuggestions as AnalysisResult["rewriteSuggestions"],
  };
}

export async function analyzeResumeMatch(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL });

  const result = await model.generateContent(buildPrompt(resumeText, jobDescription));
  const raw = result.response.text();
  const jsonString = extractJson(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("Failed to parse the analysis response as JSON.");
  }

  return validateResult(parsed);
}
