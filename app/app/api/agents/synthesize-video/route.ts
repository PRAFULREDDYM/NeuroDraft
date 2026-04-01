import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

import { createRun } from "@/lib/event-bus";
import { cacheAsync } from "@/lib/pipeline-cache";
import { extractJSON, withGroqRetry } from "@/lib/groq";
import { synthesizeVideo } from "@/lib/pipeline";
import type { DirectedScene, StoryboardCard, VideoResult } from "@/lib/types";

interface SynthesizeVideoRequest {
  scenes: DirectedScene[];
  runId?: string;
}

interface RawStoryboardCard {
  scene_id?: number;
  tab_label?: string;
  summary?: string;
  camera?: string;
  motion?: string;
  audio?: string;
  on_screen_text?: string;
}

interface RawStoryboardResponse {
  storyboard_title?: string;
  cards?: RawStoryboardCard[];
}

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  return new Groq({ apiKey });
}

function createFallbackStoryboardCards(scenes: DirectedScene[]): StoryboardCard[] {
  return scenes.map((scene) => ({
    scene_id: scene.id,
    tab_label: `Scene ${scene.id}`,
    summary: scene.description,
    camera: scene.camera,
    motion: scene.refined_prompt,
    audio: scene.audio_direction,
    on_screen_text: scene.voiceover || scene.music_direction || `Scene ${scene.id}`
  }));
}

async function buildStoryboardCards(scenes: DirectedScene[]): Promise<{ banner: string; cards: StoryboardCard[] }> {
  const fallbackCards = createFallbackStoryboardCards(scenes);
  const client = getGroqClient();

  return cacheAsync("groq:storyboard-cards", [scenes], async () => {
    if (!client) {
      return {
        banner: "Storyboard preview generated from script scenes.",
        cards: fallbackCards
      };
    }

    try {
      const response = await withGroqRetry(() =>
        client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          temperature: 0.25,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You turn directed commercial scenes into a text-first storyboard preview. Return ONLY valid JSON:
{
  "storyboard_title": "Short title",
  "cards": [
    {
      "scene_id": 1,
      "tab_label": "Opening beat",
      "summary": "One plain-English sentence describing the scene",
      "camera": "Camera direction in plain English",
      "motion": "Motion or pacing note",
      "audio": "Audio and VO note",
      "on_screen_text": "Any visible text, CTA, or branding cue"
    }
  ]
}
Keep each card concise, readable, and designed for a storyboard tab layout.`
            },
            {
              role: "user",
              content: JSON.stringify(scenes)
            }
          ]
        })
      );

      const rawContent = response.choices[0]?.message.content ?? "{}";
      const parsed = JSON.parse(extractJSON(rawContent)) as RawStoryboardResponse;
      const cards = Array.isArray(parsed.cards) && parsed.cards.length > 0
        ? parsed.cards.map((card, index) => {
            const scene = scenes[index] ?? scenes[0];
            return {
              scene_id: typeof card.scene_id === "number" ? card.scene_id : scene.id,
              tab_label:
                typeof card.tab_label === "string" && card.tab_label.trim().length > 0
                  ? card.tab_label
                  : `Scene ${scene.id}`,
              summary:
                typeof card.summary === "string" && card.summary.trim().length > 0
                  ? card.summary
                  : scene.description,
              camera:
                typeof card.camera === "string" && card.camera.trim().length > 0
                  ? card.camera
                  : scene.camera,
              motion:
                typeof card.motion === "string" && card.motion.trim().length > 0
                  ? card.motion
                  : scene.refined_prompt,
              audio:
                typeof card.audio === "string" && card.audio.trim().length > 0
                  ? card.audio
                  : scene.audio_direction,
              on_screen_text:
                typeof card.on_screen_text === "string" && card.on_screen_text.trim().length > 0
                  ? card.on_screen_text
                  : scene.voiceover || scene.music_direction || `Scene ${scene.id}`
            };
          })
        : fallbackCards;

      return {
        banner: typeof parsed.storyboard_title === "string" && parsed.storyboard_title.trim().length > 0
          ? parsed.storyboard_title
          : "Storyboard preview generated from Groq scene cards.",
        cards
      };
    } catch {
      return {
        banner: "Storyboard preview generated from script scenes.",
        cards: fallbackCards
      };
    }
  });
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<VideoResult | { error: string }>> {
  const body = (await req.json()) as Partial<SynthesizeVideoRequest>;
  const scenes = body.scenes ?? [];
  const runId = body.runId ?? "standalone-video";

  if (scenes.length === 0) {
    return NextResponse.json({ error: "Directed scenes are required" }, { status: 400 });
  }

  createRun(runId);
  const video = await synthesizeVideo(runId, scenes);

  if (video.type === "storyboard") {
    const storyboard = await buildStoryboardCards(scenes);
    return NextResponse.json({
      ...video,
      banner: video.banner ?? storyboard.banner,
      storyboard_cards: storyboard.cards
    });
  }

  return NextResponse.json(video);
}
