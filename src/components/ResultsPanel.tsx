"use client";

import { CheckCircle2, AlertTriangle, AlertCircle, Circle, ArrowRight } from "lucide-react";
import ScoreGauge from "./ScoreGauge";
import type { AnalysisResult } from "@/lib/types";

interface ResultsPanelProps {
  result: AnalysisResult;
}

const importanceConfig = {
  critical: {
    label: "Critical",
    icon: AlertCircle,
    badgeClass: "bg-danger-soft text-danger",
  },
  important: {
    label: "Important",
    icon: AlertTriangle,
    badgeClass: "bg-warning-soft text-warning",
  },
  "nice-to-have": {
    label: "Nice to have",
    icon: Circle,
    badgeClass: "bg-line text-ink-soft",
  },
} as const;

export default function ResultsPanel({ result }: ResultsPanelProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Score + verdict */}
      <section className="flex flex-col items-center gap-5 rounded-2xl border border-line bg-paper-raised px-6 py-10 sm:flex-row sm:items-center sm:gap-10 sm:px-10">
        <ScoreGauge score={result.matchScore} />
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            {result.verdict}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            {result.summary}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Matched skills */}
        <section className="rounded-2xl border border-line bg-paper-raised p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-success" />
            <h3 className="font-display text-base font-semibold text-ink">
              What's already there
            </h3>
            <span className="ml-auto font-mono text-xs text-ink-soft">
              {result.matchedSkills.length}
            </span>
          </div>
          <ul className="flex flex-col gap-3">
            {result.matchedSkills.map((item, i) => (
              <li key={i} className="border-l-2 border-success-soft pl-3">
                <p className="text-sm font-medium text-ink">{item.skill}</p>
                <p className="text-xs leading-relaxed text-ink-soft mt-0.5">
                  {item.evidence}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Missing skills */}
        <section className="rounded-2xl border border-line bg-paper-raised p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-warning" />
            <h3 className="font-display text-base font-semibold text-ink">
              What's missing
            </h3>
            <span className="ml-auto font-mono text-xs text-ink-soft">
              {result.missingSkills.length}
            </span>
          </div>
          <ul className="flex flex-col gap-4">
            {result.missingSkills.map((item, i) => {
              const config = importanceConfig[item.importance] ?? importanceConfig["nice-to-have"];
              const Icon = config.icon;
              return (
                <li key={i} className="border-l-2 border-warning-soft pl-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-ink">{item.skill}</p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${config.badgeClass}`}
                    >
                      <Icon size={11} />
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-ink-soft mt-1">
                    {item.howToClose}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Rewrite suggestions */}
      <section className="rounded-2xl border border-line bg-paper-raised p-6">
        <h3 className="font-display text-base font-semibold text-ink mb-1">
          Lines worth rewriting
        </h3>
        <p className="text-xs text-ink-soft mb-5">
          Tailored edits that pull your real experience closer to this job's language.
        </p>
        <div className="flex flex-col gap-5">
          {result.rewriteSuggestions.map((item, i) => (
            <div
              key={i}
              className="rounded-xl bg-paper border border-line p-4 sm:p-5"
            >
              <p className="font-mono text-[11px] uppercase tracking-wide text-cobalt mb-3">
                {item.section}
              </p>
              <div className="flex flex-col gap-2">
                <div className="rounded-lg bg-danger-soft/40 border border-danger-soft px-3 py-2">
                  <p className="text-[11px] font-medium text-danger mb-0.5">Before</p>
                  <p className="text-sm text-ink-soft leading-relaxed">{item.original}</p>
                </div>
                <div className="flex justify-center text-ink-soft">
                  <ArrowRight size={14} />
                </div>
                <div className="rounded-lg bg-success-soft/50 border border-success-soft px-3 py-2">
                  <p className="text-[11px] font-medium text-success mb-0.5">After</p>
                  <p className="text-sm text-ink leading-relaxed">{item.rewritten}</p>
                </div>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed mt-3 italic">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
