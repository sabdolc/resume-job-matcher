import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile, UnsupportedFileTypeError } from "@/lib/parseResume";
import { analyzeResumeMatch } from "@/lib/claude";
import type { AnalyzeErrorResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const MIN_JD_LENGTH = 30;
const MAX_JD_LENGTH = 10000;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");
    const jobDescription = formData.get("jobDescription");

    if (!(file instanceof File)) {
      return errorResponse("Please attach a resume file.", 400);
    }

    if (typeof jobDescription !== "string" || jobDescription.trim().length < MIN_JD_LENGTH) {
      return errorResponse(
        "Please paste the full job description (at least a few sentences).",
        400
      );
    }

    if (jobDescription.length > MAX_JD_LENGTH) {
      return errorResponse(
        `The job description is too long. Please keep it under ${MAX_JD_LENGTH.toLocaleString()} characters.`,
        400
      );
    }

    if (file.size === 0) {
      return errorResponse("The uploaded resume file is empty.", 400);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return errorResponse("The resume file is too large. Please upload a file under 8MB.", 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let resumeText: string;
    try {
      resumeText = await extractTextFromFile(buffer, file.type, file.name);
    } catch (err) {
      if (err instanceof UnsupportedFileTypeError) {
        return errorResponse("Please upload a PDF or DOCX file.", 400);
      }
      console.error("Resume parsing failed:", err);
      return errorResponse(
        "Couldn't read that file. Make sure it's a valid PDF or DOCX and try again.",
        400
      );
    }

    if (resumeText.length < 50) {
      return errorResponse(
        "Couldn't find enough text in that resume. If it's a scanned image, try a text-based PDF or DOCX instead.",
        400
      );
    }

    const result = await analyzeResumeMatch(resumeText, jobDescription.trim());

    return NextResponse.json(result);
  } catch (err) {
    console.error("Analysis failed:", err);
    const message =
      err instanceof Error && err.message.includes("GEMINI_API_KEY")
        ? "Server is missing an API key. Add GEMINI_API_KEY to your environment."
        : "Something went wrong while analyzing your resume. Please try again.";
    return errorResponse(message, 500);
  }
}

function errorResponse(message: string, status: number) {
  const body: AnalyzeErrorResponse = { error: message };
  return NextResponse.json(body, { status });
}
