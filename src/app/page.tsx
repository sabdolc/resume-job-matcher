"use client";

import { useState } from "react";
import { Loader2, AlertCircle, ScanSearch } from "lucide-react";
import ResumeUpload from "@/components/ResumeUpload";
import ResultsPanel from "@/components/ResultsPanel";
import type { AnalysisResult, AnalyzeErrorResponse } from "@/lib/types";

type Status = "idle" | "loading" | "error" | "done";

const MIN_JD_LENGTH = 30;
const MAX_JD_LENGTH = 10000;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const canSubmit = file !== null && jobDescription.trim().length >= MIN_JD_LENGTH && status !== "loading";

  async function handleSubmit() {
    if (!file) return;
    setStatus("loading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body: AnalyzeErrorResponse = await res.json();
        setError(body.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      setStatus("done");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  function handleStartOver() {
    setFile(null);
    setJobDescription("");
    setResult(null);
    setError(null);
    setStatus("idle");
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        {/* Header */}
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 rounded-full border border-line bg-paper-raised px-3 py-1 mb-5">
            <ScanSearch size={14} className="text-cobalt" />
            <span className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              resume diagnostics
            </span>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Fit Check
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
            Upload your resume and the job posting. Get a clear score, the gaps
            standing between you and the role, and exact lines worth rewriting.
          </p>
        </header>

        {status !== "done" ? (
          <div className="flex flex-col gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink">
                Your resume
              </label>
              <ResumeUpload file={file} onFileSelected={setFile} />
            </div>

            <div>
              <label
                htmlFor="job-description"
                className="mb-2 block text-sm font-medium text-ink"
              >
                Job description
              </label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job posting here — responsibilities, requirements, qualifications..."
                rows={9}
                maxLength={MAX_JD_LENGTH}
                className="w-full resize-none rounded-xl border border-line bg-paper-raised px-4 py-3.5 text-sm text-ink placeholder:text-ink-soft/70 outline-none transition-colors focus:border-cobalt"
              />
              <p className="mt-1.5 text-xs text-ink-soft">
                {jobDescription.trim().length < MIN_JD_LENGTH
                  ? "Paste a few sentences at minimum so the analysis has enough to work with."
                  : jobDescription.length >= MAX_JD_LENGTH
                  ? `Limit reached — ${MAX_JD_LENGTH.toLocaleString()} characters max.`
                  : `${jobDescription.trim().length.toLocaleString()} / ${MAX_JD_LENGTH.toLocaleString()} characters`}
              </p>
            </div>

            {status === "error" && error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-danger-soft bg-danger-soft px-4 py-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center justify-center gap-2 rounded-xl bg-cobalt px-5 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing your fit...
                </>
              ) : (
                "Check my fit"
              )}
            </button>
          </div>
        ) : (
          result && (
            <div className="flex flex-col gap-6">
              <ResultsPanel result={result} />
              <button
                type="button"
                onClick={handleStartOver}
                className="self-center text-sm font-medium text-cobalt underline underline-offset-2 cursor-pointer"
              >
                Check another job
              </button>
            </div>
          )
        )}
      </div>
    </main>
  );
}
