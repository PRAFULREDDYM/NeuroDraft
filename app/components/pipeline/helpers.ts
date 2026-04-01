import type { NeuralOverall, NeuralPrediction, NeuralSegment } from "@/lib/types";

export function scoreColor(metric: string): string {
  switch (metric) {
    case "visual_cortex_engagement":
      return "var(--neural-visual)";
    case "auditory_cortex_engagement":
      return "var(--neural-auditory)";
    case "prefrontal_attention":
      return "var(--neural-attention)";
    case "amygdala_emotional_arousal":
      return "var(--neural-emotional)";
    case "hippocampal_memory_encoding":
      return "var(--neural-memory)";
    default:
      return "var(--neural-overall)";
  }
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function estimateOverallFromPrediction(prediction: NeuralPrediction | null): NeuralOverall | null {
  return prediction?.overall ?? null;
}

export function getSceneById(prediction: NeuralPrediction | null, sceneId: number): NeuralSegment | null {
  return prediction?.segments.find((segment) => segment.scene_id === sceneId) ?? null;
}
