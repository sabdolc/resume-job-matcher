import mammoth from "mammoth";

export class UnsupportedFileTypeError extends Error {
  constructor(mimeType: string) {
    super(`Unsupported file type: ${mimeType}. Please upload a PDF or DOCX file.`);
    this.name = "UnsupportedFileTypeError";
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Use the CJS bundle directly to avoid dynamic import bundling issues
  // in serverless environments (Netlify Functions, Vercel, etc.)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PDFParse } = require("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}

/**
 * Extracts plain text from an uploaded resume file (PDF or DOCX).
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const lowerName = fileName.toLowerCase();

  const isPdf = mimeType === "application/pdf" || lowerName.endsWith(".pdf");
  const isDocx =
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx");

  if (isPdf) {
    return extractPdfText(buffer);
  }

  if (isDocx) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  throw new UnsupportedFileTypeError(mimeType || lowerName);
}
