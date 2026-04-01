import type {
  NeuralMetricKey,
  NeuralPrediction,
  NeuralScores,
  NeuralSegment
} from "@/lib/types";

export type ScoreLevel = "weak" | "fair" | "strong" | "peak";

export interface MetricTranslation {
  plainName: string;
  icon: "eye" | "ear" | "focus" | "heart" | "brain" | "activity";
  low: string;
  mid: string;
  high: string;
  peak: string;
}

export const METRIC_TRANSLATIONS: Record<NeuralMetricKey, MetricTranslation> = {
  visual_cortex_engagement: {
    plainName: "Visual attention",
    icon: "eye",
    low: "Viewers are not being pulled in visually. The frame needs more contrast, motion, or product presence.",
    mid: "The scene is holding the eye, but it could use a stronger focal point to become more arresting.",
    high: "Strong visual pull. Viewers are actively processing the image and staying with the shot.",
    peak: "Exceptional visual engagement. This scene is visually arresting and hard to ignore."
  },
  auditory_cortex_engagement: {
    plainName: "Sound impact",
    icon: "ear",
    low: "The audio is not reinforcing the message. Music or voice tone may feel mismatched.",
    mid: "Audio is present, but it is not yet amplifying the emotional impact of the ad.",
    high: "Sound and visuals are working together well, which helps the ad feel cohesive.",
    peak: "The audio is a major driver of impact here and is doing a lot of the persuasion work."
  },
  prefrontal_attention: {
    plainName: "Conscious attention",
    icon: "focus",
    low: "Viewers are likely to zone out here. The scene lacks a clear focal point or story beat.",
    mid: "Attention is present, but it is fragile and could be lost with a small distraction.",
    high: "Viewers are actively following the story and processing the message.",
    peak: "Peak focus. Viewers are fully locked in and paying close attention."
  },
  amygdala_emotional_arousal: {
    plainName: "Emotional response",
    icon: "heart",
    low: "This scene is emotionally flat. It is unlikely to create a feeling that sticks.",
    mid: "There is some emotional texture, but the hook could be warmer or more surprising.",
    high: "Good emotional response. Viewers are feeling something meaningful here.",
    peak: "Strong emotional spike. This moment is likely to be felt, not just seen."
  },
  hippocampal_memory_encoding: {
    plainName: "Memory strength",
    icon: "brain",
    low: "This scene is unlikely to be remembered tomorrow without more novelty or repetition.",
    mid: "Moderate recall likelihood. The scene is processed, but not deeply encoded.",
    high: "This scene is likely to be remembered because it is clear, distinct, and meaningful.",
    peak: "Exceptionally memorable. This is the moment that will stick."
  },
  overall_engagement: {
    plainName: "Overall brain engagement",
    icon: "activity",
    low: "The brain is in passive mode here, so the ad risks being mentally skipped.",
    mid: "Moderate overall engagement. The ad is being watched, but not fully absorbed.",
    high: "High overall engagement. The brain is active and receptive.",
    peak: "Peak brain engagement. Everything is firing together."
  }
};

const LEVEL_CONFIG: Record<
  ScoreLevel,
  {
    label: string;
    color: string;
    barWidth: string;
  }
> = {
  weak: {
    label: "Weak",
    color: "#ef4444",
    barWidth: "25%"
  },
  fair: {
    label: "Fair",
    color: "#f97316",
    barWidth: "50%"
  },
  strong: {
    label: "Strong",
    color: "#22c55e",
    barWidth: "75%"
  },
  peak: {
    label: "Peak",
    color: "#00ff88",
    barWidth: "100%"
  }
};

export function scoreToLevel(score: number): ScoreLevel {
  if (score < 0.35) {
    return "weak";
  }
  if (score < 0.55) {
    return "fair";
  }
  if (score < 0.78) {
    return "strong";
  }
  return "peak";
}

export function getLevelConfig(score: number): {
  level: ScoreLevel;
  label: string;
  color: string;
  barWidth: string;
} {
  const level = scoreToLevel(score);
  return {
    level,
    ...LEVEL_CONFIG[level]
  };
}

export function getMetricTranslation(metric: NeuralMetricKey): MetricTranslation {
  return METRIC_TRANSLATIONS[metric];
}

export function averageMetricScore(prediction: NeuralPrediction | null, metric: NeuralMetricKey): number {
  if (!prediction || prediction.segments.length === 0) {
    return 0;
  }

  const total = prediction.segments.reduce((sum, segment) => sum + segment.neural_scores[metric], 0);
  return total / prediction.segments.length;
}

export function getMetricExplanation(metric: NeuralMetricKey, score: number): string {
  const translation = getMetricTranslation(metric);
  const level = scoreToLevel(score);

  switch (level) {
    case "weak":
      return translation.low;
    case "fair":
      return translation.mid;
    case "strong":
      return translation.high;
    case "peak":
      return translation.peak;
  }
}

function describeNumericBand(score: number): string {
  const percent = Math.round(score * 100);
  if (score < 0.35) {
    return `at ${percent}%, which is a weak signal`;
  }
  if (score < 0.55) {
    return `at ${percent}%, which is a fair signal`;
  }
  if (score < 0.78) {
    return `at ${percent}%, which is a strong signal`;
  }
  return `at ${percent}%, which is a peak signal`;
}

export function getMetricAdMeaning(metric: NeuralMetricKey, score: number): string {
  const translation = getMetricTranslation(metric);
  return `${translation.plainName} is ${describeNumericBand(score)}.`;
}

export function getSceneTag(scores: NeuralScores): string {
  const overall = scores.overall_engagement;
  const memory = scores.hippocampal_memory_encoding;
  const emotion = scores.amygdala_emotional_arousal;
  const attention = scores.prefrontal_attention;

  if (memory > 0.75) {
    return "Memory spike";
  }
  if (emotion > 0.7 && overall > 0.65) {
    return "Emotional peak";
  }
  if (attention < 0.35) {
    return "Attention drop";
  }
  if (overall > 0.7) {
    return "Strong moment";
  }
  if (overall < 0.35) {
    return "Flat zone";
  }
  return "Moderate engagement";
}

export function summarizeSceneSegment(segment: NeuralSegment): string {
  const tag = getSceneTag(segment.neural_scores);
  const overallLevel = getLevelConfig(segment.neural_scores.overall_engagement).level;

  switch (tag) {
    case "Memory spike":
      return "This is the scene viewers are most likely to remember, so it deserves the clearest brand cue.";
    case "Emotional peak":
      return "This is the emotional high point, so the pacing and music should protect it.";
    case "Attention drop":
      return "Attention drops here, so this scene needs more motion, contrast, or a stronger story beat.";
    case "Strong moment":
      return "This is a strong moment in the ad and should stay prominent in the final cut.";
    case "Flat zone":
      return "This scene is likely to fade quickly, so it needs more specificity or a sharper visual hook.";
    default:
      return overallLevel === "peak"
        ? "This scene is highly effective and likely to carry the message forward."
        : "This scene is working, but it still leaves room for a clearer brand signal.";
  }
}

export function buildOverallVerdict(prediction: NeuralPrediction, insightCount: number): string {
  const first = prediction.segments[0];
  const last = prediction.segments[prediction.segments.length - 1];
  const opener = first && first.neural_scores.overall_engagement < 0.45
    ? "The opening is a little soft, so the first beat needs to work harder."
    : "The opening does a solid job of pulling the viewer into the ad.";
  const ending = last && last.neural_scores.overall_engagement > 0.7
    ? "The ending lands well and should help the brand stay remembered."
    : "The ending could use a sharper payoff so the ad finishes with more stickiness.";
  return `${opener} ${ending} The model found ${insightCount} actionable creative fixes.`;
}

export function buildEngagementArcExplanation(prediction: NeuralPrediction): string {
  switch (prediction.overall.engagement_arc) {
    case "rising":
      return "Engagement climbs as the ad moves forward, which means the middle and end are doing the heavy lifting. That is good for recall, but the opening still needs a sharper hook.";
    case "plateau":
      return "Engagement stays fairly even, which keeps the ad steady but can make it feel a little flat. A stronger contrast between scenes would create more momentum.";
    case "declining":
      return "Engagement falls as the ad progresses, so the strongest ideas are arriving too early or not being reinforced enough. The closing moments need more energy.";
    case "volatile":
      return "Engagement jumps around, which can create excitement but also risks confusion. The ad would benefit from a smoother narrative arc.";
  }
}
