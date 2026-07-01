"use client";

import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
}

function getScoreColor(score: number): { stroke: string; text: string } {
  if (score >= 70) return { stroke: "var(--success)", text: "text-success" };
  if (score >= 40) return { stroke: "var(--warning)", text: "text-warning" };
  return { stroke: "var(--danger)", text: "text-danger" };
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { stroke, text } = getScoreColor(score);

  useEffect(() => {
    // Animate the needle/arc sweep on mount.
    const duration = 900;
    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      if (progress >= 1) {
        setAnimatedScore(score); // guarantee exact final value, no rounding drift
      } else {
        setAnimatedScore(Math.round(eased * score));
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  // Gauge sweeps 270 degrees (like an instrument dial), starting at -225deg
  const sweepFraction = 0.75;
  const arcLength = circumference * sweepFraction;
  const dashOffset = arcLength - (animatedScore / 100) * arcLength;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width="220"
        height="220"
        viewBox="0 0 220 220"
        className="-rotate-[225deg]"
        role="img"
        aria-label={`Match score: ${score} out of 100`}
      >
        {/* Track */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth="14"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="14"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke 0.3s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`font-mono text-6xl font-bold tabular-nums ${text}`}>
          {animatedScore}
        </span>
        <span className="font-mono text-xs uppercase tracking-widest text-ink-soft mt-1">
          match score
        </span>
      </div>
    </div>
  );
}
