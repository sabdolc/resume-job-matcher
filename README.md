# Fit Check — Resume to Job Match

Upload a resume (PDF/DOCX) and paste a job description. Get back a match score,
what's already strong, what's missing, and exact resume lines worth rewriting —
powered by Claude.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Anthropic API** (`@anthropic-ai/sdk`) for the matching/analysis logic
- **mammoth** for DOCX text extraction
- **pdf-parse** (v2) for PDF text extraction
- **lucide-react** for icons

## Project structure

```
src/
  app/
    page.tsx                    # Main UI: upload form + results
    layout.tsx                  # Root layout, fonts, metadata
    globals.css                 # Design tokens (colors, fonts)
    api/analyze/route.ts        # POST endpoint: parses file, calls Claude, returns JSON
  components/
    ResumeUpload.tsx            # Drag-and-drop / click-to-browse file input
    ScoreGauge.tsx               # Animated circular match-score gauge
    ResultsPanel.tsx             # Matched/missing skills + rewrite suggestions display
  lib/
    types.ts                     # Shared TypeScript types for the analysis result
    parseResume.ts                # PDF/DOCX -> plain text extraction
    claude.ts                      # Anthropic API call + prompt + response validation
```

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Add your Anthropic API key**

   Copy the example env file and fill in your key:

   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local`:

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

   Get a key at console.anthropic.com/settings/keys.

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## How it works

1. The person uploads a resume file and pastes a job description in the browser.
2. On submit, the file + job description are sent as multipart/form-data to POST /api/analyze.
3. The API route extracts plain text from the PDF/DOCX server-side (so the API key never touches the browser).
4. The extracted resume text + job description are sent to Claude with a structured prompt asking for a JSON response: match score, matched skills, missing skills (with concrete advice), and specific before/after rewrite suggestions.
5. The JSON is validated server-side and returned to the client, which renders the results.

The app is stateless — nothing is persisted to a database. Each analysis is a single request/response cycle.

## Notes for deployment

- Set ANTHROPIC_API_KEY as an environment variable on whatever platform you deploy to (Vercel, etc.) — never commit it.
- The API route is on Node.js runtime (export const runtime = "nodejs") since pdf-parse and mammoth need Node APIs.
- Max file size is capped at 8MB; adjust MAX_FILE_SIZE_BYTES in src/app/api/analyze/route.ts if needed.

## Possible next steps

- Persist analyses (would need a database — currently intentionally stateless)
- Export results or rewritten resume as a downloadable file
- Side-by-side comparison across multiple job descriptions
- Auth + saved history for an application-tracking dashboard
