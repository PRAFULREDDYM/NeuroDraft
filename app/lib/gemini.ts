import Groq from "groq-sdk";

import { createDemoVideoResult } from "@/lib/mock-data";
import { extractJSON } from "@/lib/groq";
import { withRetry } from "@/lib/utils";
import type { DirectedScene, StoryboardFrame, VideoResult } from "@/lib/types";

interface RawStoryboardFrame {
  scene_id?: number;
  time_range?: string;
  frame_title?: string;
  visual_description?: string;
  camera?: string;
  mood?: string;
  color_palette?: string[] | string;
  key_element?: string;
  duration?: number;
}

interface RawStoryboardResponse {
  storyboard?: RawStoryboardFrame[];
}

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  return apiKey ? new Groq({ apiKey }) : null;
}

function fallbackPalette(index: number): string[] {
  return index % 2 === 0 ? ["#111827", "#14532d", "#00ff88"] : ["#0f172a", "#1f2937", "#38bdf8"];
}

function normalizePalette(value: string[] | string | undefined, index: number): string[] {
  if (Array.isArray(value)) {
    const colors = value.filter((entry) => typeof entry === "string" && entry.trim().length > 0).slice(0, 3);
    if (colors.length === 3) {
      return colors;
    }
  }

  if (typeof value === "string") {
    const colors = value
      .split(/[,\s]+/)
      .filter((entry) => entry.startsWith("#"))
      .slice(0, 3);
    if (colors.length === 3) {
      return colors;
    }
  }

  return fallbackPalette(index);
}

function createFallbackStoryboard(scenes: DirectedScene[]): StoryboardFrame[] {
  return scenes.map((scene, index) => ({
    scene_id: scene.id,
    time_range: `${scene.start_time}-${scene.end_time}s`,
    frame_title: index === 0 ? "Opening brand moment" : `Scene ${scene.id} visual beat`,
    visual_description: scene.description,
    camera: scene.camera,
    mood: scene.mood,
    color_palette: fallbackPalette(index),
    key_element: scene.voiceover || scene.music_direction || `Scene ${scene.id} focus`,
    duration: scene.end_time - scene.start_time
  }));
}

async function buildStoryboardWithGroq(scenes: DirectedScene[]): Promise<StoryboardFrame[]> {
  const groq = getGroqClient();
  const fallback = createFallbackStoryboard(scenes);

  if (!groq) {
    return fallback;
  }

  try {
    const response = await withRetry(() =>
      groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: `For each scene, generate a rich visual storyboard card. Return ONLY valid JSON:
{
  "storyboard": [
    {
      "scene_id": 1,
      "time_range": "0-6s",
      "frame_title": "Short evocative title for this scene",
      "visual_description": "2 sentences describing what the viewer sees. Be specific and cinematic.",
      "camera": "Camera angle and motion",
      "mood": "One word mood",
      "color_palette": ["#0f172a", "#14532d", "#00ff88"],
      "key_element": "The single most important visual element in this scene",
      "duration": 6
    }
  ]
}`
          },
          {
            role: "user",
            content: JSON.stringify(
              scenes.map((scene) => ({
                id: scene.id,
                start_time: scene.start_time,
                end_time: scene.end_time,
                description: scene.description,
                mood: scene.mood,
                camera: scene.camera,
                duration: scene.end_time - scene.start_time
              }))
            )
          }
        ]
      })
    );

    const raw = response.choices[0]?.message.content ?? "{}";
    const parsed = JSON.parse(extractJSON(raw)) as RawStoryboardResponse;
    const storyboard = Array.isArray(parsed.storyboard) ? parsed.storyboard : [];

    if (storyboard.length === 0) {
      return fallback;
    }

    return scenes.map((scene, index) => {
      const frame = storyboard[index];
      return {
        scene_id: typeof frame?.scene_id === "number" ? frame.scene_id : scene.id,
        time_range:
          typeof frame?.time_range === "string" && frame.time_range.trim().length > 0
            ? frame.time_range
            : `${scene.start_time}-${scene.end_time}s`,
        frame_title:
          typeof frame?.frame_title === "string" && frame.frame_title.trim().length > 0
            ? frame.frame_title
            : fallback[index]?.frame_title ?? `Scene ${scene.id}`,
        visual_description:
          typeof frame?.visual_description === "string" && frame.visual_description.trim().length > 0
            ? frame.visual_description
            : scene.description,
        camera:
          typeof frame?.camera === "string" && frame.camera.trim().length > 0
            ? frame.camera
            : scene.camera,
        mood:
          typeof frame?.mood === "string" && frame.mood.trim().length > 0
            ? frame.mood
            : scene.mood,
        color_palette: normalizePalette(frame?.color_palette, index),
        key_element:
          typeof frame?.key_element === "string" && frame.key_element.trim().length > 0
            ? frame.key_element
            : fallback[index]?.key_element ?? `Scene ${scene.id} focus`,
        duration:
          typeof frame?.duration === "number" && Number.isFinite(frame.duration)
            ? frame.duration
            : scene.end_time - scene.start_time
      };
    });
  } catch {
    return fallback;
  }
}

export async function synthesizeVideoWithGemini(
  directed: DirectedScene[],
  uploadedFileId?: string
): Promise<VideoResult> {
  const demo = createDemoVideoResult(directed);
  const storyboard = await buildStoryboardWithGroq(directed);

  return {
    ...demo,
    tier: process.env.GEMINI_API_KEY ? "fallback" : "demo",
    video_url: null,
    frames: null,
    storyboard,
    banner: uploadedFileId ? "Scene previews generated from your uploaded video" : "Scene previews generated from your script"
  };
}
