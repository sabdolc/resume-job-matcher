import mammoth from "mammoth";

export class UnsupportedFileTypeError extends Error {
  constructor(mimeType: string) {
    super(`Unsupported file type: ${mimeType}. Please upload a PDF or DOCX file.`);
    this.name = "UnsupportedFileTypeError";
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  // pdf2json is pure JS with no native Node dependencies — reliable in serverless.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PDFParser = require("pdf2json");

  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, 1);

    parser.on("pdfParser_dataReady", (data: {
      Pages: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }>
    }) => {
      const text = data.Pages
        .flatMap((page) => page.Texts)
        .map((t) => {
          try {
            return decodeURIComponent(t.R.map((r) => r.T).join(""));
          } catch {
            return t.R.map((r) => r.T).join("");
          }
        })
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      resolve(text);
    });

    parser.on("pdfParser_dataError", (err: Error) => {
      reject(new Error(`PDF parsing failed: ${err.message}`));
    });

    parser.parseBuffer(buffer);
  });
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
