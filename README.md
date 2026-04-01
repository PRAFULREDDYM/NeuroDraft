# NeuroDraft

**Know how your ad lands on the brain — before you spend a dollar on production.**

NeuroDraft is an AI-powered creative intelligence tool that takes your ad script and returns a predicted neural engagement report in about 30 seconds. It tells you which scenes will hold attention, which ones lose the viewer, what emotion each beat triggers, and exactly what to rewrite to make the campaign stronger.

It is built on TRIBE v2 — a foundation model released by Meta's AI research team in March 2025, trained on over 1,000 hours of fMRI brain scans from 720 subjects. NeuroDraft wraps that science into a workflow any creative team can use.

---

## What it does

When you paste an ad script into NeuroDraft, six AI agents fire simultaneously:

1. **Script Expander** — reads your script and breaks it into structured scenes with timing, emotional arc, voiceover, and camera direction
2. **Scene Director** — writes a production-ready visual brief for each scene
3. **Scene Preview** — generates an AI storyboard showing what each scene looks like: colors, composition, key visual element, and mood
4. **Transcript Builder** — creates a word-by-word timestamped breakdown of the voiceover
5. **TRIBE Predictor** — scores every scene on six neural metrics calibrated to real fMRI data
6. **Insight Writer** — translates those scores into five specific, actionable creative notes

A seventh agent — the **Quality Checker** — evaluates the output automatically and reruns any agent that produces incomplete or low-quality results.

---

## The output

For every ad script you analyze, you get:

- **A neural grade** (A through F) and a benchmark percentile vs. other ads
- **Six metric scores** per scene: visual attention, sound impact, conscious focus, emotional response, memory strength, and overall engagement
- **An engagement arc** showing whether attention rises, falls, or is volatile
- **Five creative insights** — each with a plain-English finding and a specific recommendation for what to change
- **A rewrite suggestion** for the weakest scene, with before and after
- **A headline recall test** with three alternative headlines ranked by predicted memory
- **A quality verification score** showing how reliable the analysis is
- **A downloadable PDF report** with everything above

---

## How the neural scoring works

NeuroDraft does not have a real fMRI machine. What it has is a prediction model calibrated against TRIBE v2's documented output patterns.

TRIBE v2 (Meta Research, 2026) is an open-source model that was trained to predict what a human brain scan would look like in response to a video, audio track, and text simultaneously. It was trained on real brain scans from 720 volunteers watching movies and podcasts for over 1,000 hours.

NeuroDraft uses that model's documented behavior — the patterns it learned about which stimuli activate which brain regions — to score your script. When the predictor sees a scene with unexpected humor, it knows from the fMRI literature that this activates the amygdala and encodes strongly in the hippocampus (memory). When it sees a slow, undifferentiated product shot, it scores visual attention and prefrontal engagement lower.

The scores are predictions, not ground truth. They are directional signal, not scientific certainty. NeuroDraft is honest about this throughout the UI.

---

## The six metrics explained

| Metric | Brain region | What it measures |
|--------|-------------|------------------|
| Visual attention | Visual cortex | How much the eye is drawn to and holds on the image |
| Sound impact | Auditory cortex | How well the audio reinforces the message and emotion |
| Conscious focus | Prefrontal cortex | Whether the viewer is actively following the story |
| Emotional response | Amygdala | The strength of the emotional reaction — positive or negative |
| Memory strength | Hippocampus | How likely this scene is to be remembered the next day |
| Overall engagement | Whole brain | Combined signal: is the brain active and receptive? |

Scores above 0.70 are strong. Below 0.40 is a warning zone. The heatmap shows you every scene across all six metrics simultaneously.

---

## Project structure

```text
NeuroDraft/
├── app/                    # The SaaS analysis tool (Next.js 15)
│   ├── app/
│   │   ├── analyze/        # Main workspace — paste script, run analysis
│   │   └── results/[id]/   # Full results deep-dive
│   ├── api/
│   │   ├── pipeline/       # Start pipeline, SSE status stream
│   │   └── agents/         # Six agent routes + evaluator
│   ├── components/
│   │   └── pipeline/       # AgentCard, NeuralHeatmap, InsightPanel, etc.
│   └── lib/
│       ├── pipeline.ts      # Background orchestrator
│       ├── event-bus.ts     # SSE in-memory event bus
│       ├── results-store.ts # In-memory result storage
│       └── groq.ts          # Groq client + retry logic
│
└── landing/                # Marketing site (Next.js 15, separate deploy)
    ├── app/
    │   └── page.tsx        # Full marketing page
    └── components/
        ├── Hero.tsx
        ├── Features.tsx
        ├── HowItWorks.tsx
        ├── DemoPreview.tsx
        └── CTA.tsx
```

---

## Setup — local development

### Prerequisites

- Node.js 18 or higher
- A Groq API key (free at [console.groq.com](https://console.groq.com))
- A Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Step 1 — Clone and install

```bash
git clone https://github.com/PRAFULREDDYM/NeuroDraft.git
cd NeuroDraft

# Install all workspace packages (root has npm workspaces for app + landing)
npm install
```

### Step 2 — Environment variables (where they live)

| File | Purpose |
|------|---------|
| **`app/.env.local`** | **Your real keys** for the analysis app (`GROQ_API_KEY`, `GEMINI_API_KEY`, public URLs). **Not in Git** — create it locally. |
| **`landing/.env.local`** | Public URLs for the marketing site. **Not in Git.** |
| **`app/.env.example`** | Template you copy from (safe to commit). |
| **`landing/.env.example`** | Template for the landing app (safe to commit). |
| **`app/.env.production` / `landing/.env.production`** | Deploy-time **public** URLs only; committed for Vercel-style setups. |

From the repo root:

```bash
cp app/.env.example app/.env.local
cp landing/.env.example landing/.env.local
```

Edit **`app/.env.local`** and replace the placeholder API keys with Groq and Gemini keys from [console.groq.com](https://console.groq.com) and [Google AI Studio](https://aistudio.google.com).

### Step 3 — Run both apps

Open two terminal windows:

**Terminal 1 — the app:**
```bash
cd NeuroDraft/app
npm run dev
```

**Terminal 2 — the landing page:**
```bash
cd NeuroDraft/landing
npm run dev
```

### Step 4 — Try it

1. Open `http://localhost:3001` to see the landing page
2. Click "Analyze your script free →" — it takes you to the app
3. Paste any ad script (minimum 15 words)
4. Click "Analyze Brain Response"
5. Watch the six agent cards light up and process
6. The scene preview, neural heatmap, and insights appear as each agent completes
7. Click "Download report" to get the PDF

---

## Testing with a good script

This script is a good test because it has strong humor and emotional hooks — the neural scores should show high emotional arousal and memory encoding:

> A man wakes up to an alarm that won't stop. He knocks it off the table. It still rings. A Red Bull can rolls into frame. Text: Mornings exist. On a packed train, squeezed between two large people, he tilts his entire body sideways to sip his Red Bull. Text: You still have to show up. In a meeting that could have been an email, a woman sips Red Bull under the table like contraband. Text: It won't end. But you will survive it. Voiceover: Red Bull. Life is relentless. So are we.

Expected output: Neural grade A or strong B, emotional arousal above 0.75, memory encoding above 0.70 on the humor scenes.

---

## Deployment

### Option A — Vercel (recommended, free tier works)

**Deploy the app:**
```bash
cd NeuroDraft/app
npx vercel
```

Then add:

- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_LANDING_URL`
- `NEXT_PUBLIC_APP_URL`

**Deploy the landing page:**
```bash
cd NeuroDraft/landing
npx vercel
```

Then add:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_LANDING_URL`

**Important:** After both are deployed, update each app's env var to point to the other's production URL, then redeploy both once more.

### One important limitation on Vercel free tier

Vercel's Hobby plan has a 60-second timeout on API routes. The full pipeline usually takes 25-45 seconds. If you consistently hit timeouts, upgrade to Vercel Pro or self-host on Railway/Render.

### Option B — Self-hosted (Railway, Render, Fly.io)

All three platforms work with standard Next.js. Set the same environment variables listed above.

---

## API keys — what they cost

| Service | What it's used for | Free tier |
|---------|-------------------|-----------|
| Groq | Script expansion, transcript, neural scoring, insights | Generous developer free tier |
| Google Gemini | Scene storyboard generation | Good enough for light testing |

For production use, expect Groq costs of roughly cents per analysis, depending on traffic and prompt sizes.

---

## How the pipeline works technically

```text
User submits script
       │
       ▼
POST /api/pipeline/start
       │
       ├─── [PARALLEL] Script expansion
       ├─── [PARALLEL] Transcript builder
       ▼
Scene preview generation
       ▼
TRIBE scoring
       ▼
Insight writing
       ▼
Quality verification
       ▼
Result stored in memory → /results/[runId]
```

The frontend connects to `/api/pipeline/status?runId=xxx` via Server-Sent Events (SSE). Every agent emits progress events through this stream, which is why the agent cards animate in real time as the pipeline runs.

**Note on persistence:** Results are stored in memory (a Node.js Map). That means results are lost if the server restarts. For production, replace `results-store.ts` with Redis or a database.

---

## Known limitations

1. **No real TRIBE v2 GPU inference** — The neural scores are LLM-calibrated predictions based on TRIBE v2's documented output patterns, not actual fMRI model inference.
2. **In-memory storage** — Results disappear on server restart.
3. **No user authentication** — This is an MVP and demo-friendly build.
4. **Scene preview uses storyboard mode** — This is intentional for a free-tier friendly workflow.

---

## What TRIBE v2 actually is

TRIBE v2 (TRImodal Brain Encoder, version 2) is a foundation model released by Meta's research team.

It was trained on over 1,000 hours of brain scan data from 720 volunteers who watched movies and listened to podcasts while inside MRI machines. The model learned to predict what brain activity patterns would occur in response to combinations of video, audio, and text.

NeuroDraft uses TRIBE v2 as the scientific basis for its scoring system — specifically the documented relationships between humor, surprise, pacing, emotional intensity, and memory formation.

---

## Contributing

This is an MVP built for speed. If you want to contribute:

- Replace in-memory storage with Redis
- Add real TRIBE inference via a GPU endpoint
- Add user accounts
- Add richer preview generation
- Extend the neural schema

Pull requests welcome.

---

*NeuroDraft is not affiliated with Meta. TRIBE v2 is Meta research. NeuroDraft is an independent product inspired by and calibrated against published research.*
