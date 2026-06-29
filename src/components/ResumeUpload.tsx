"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";

interface ResumeUploadProps {
  file: File | null;
  onFileSelected: (file: File | null) => void;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function isAcceptedFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return (
    ACCEPTED_TYPES.includes(file.type) ||
    lowerName.endsWith(".pdf") ||
    lowerName.endsWith(".docx")
  );
}

export default function ResumeUpload({ file, onFileSelected }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const candidate = files[0];
      if (!isAcceptedFile(candidate)) {
        setError("Please upload a PDF or DOCX file.");
        return;
      }
      setError(null);
      onFileSelected(candidate);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  if (file) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cobalt-soft text-cobalt">
            <FileText size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{file.name}</p>
            <p className="text-xs text-ink-soft">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onFileSelected(null)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-line hover:text-ink cursor-pointer"
          aria-label="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragging
            ? "border-cobalt bg-cobalt-soft"
            : "border-line bg-paper-raised hover:border-ink-soft"
        }`}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cobalt-soft text-cobalt">
          <Upload size={20} strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-medium text-ink">
            Drop your resume here, or{" "}
            <span className="text-cobalt underline underline-offset-2">browse</span>
          </p>
          <p className="mt-1 text-xs text-ink-soft">PDF or DOCX, up to 8MB</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
