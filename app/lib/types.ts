export type AgentName =
  | "SCRIPT_EXPANDER"
  | "SCENE_DIRECTOR"
  | "VIDEO_SYNTHESIZER"
  | "AUDIO_SYNTHESIZER"
  | "TRIBE_PREDICTOR"
  | "INSIGHT_WRITER"
  | "EVALUATOR";

export type AgentStatus =
  | "idle"
  | "running"
  | "complete"
  | "error"
  | "skipped"
  | "timeout";

export type InputMode = "script" | "rough-cut" | "final-video";
export type UploadType = "rough-cut" | "final-video";

export interface Scene {
  id: number;
  start_time: number;
  end_time: number;
  description: string;
  camera: string;
  mood: string;
  voiceover: string;
  music_direction: string;
  video_prompt: string;
}

export interface ScriptExpansion {
  title: string;
  duration_seconds: number;
  scenes: Scene[];
  full_voiceover_script: string;
  target_emotion: string;
  brand_category: string;
}

export interface DirectedScene extends Scene {
  resolution: "1080p";
  aspect_ratio: "16:9";
  emotional_intensity: "low" | "medium" | "high";
  audio_direction: string;
  refined_prompt: string;
}

export interface TranscriptSegment {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface AudioResult {
  mode: "text-only";
  audio_url: string | null;
  transcript: TranscriptSegment[];
  duration: number;
  message?: string;
}

export interface StoryboardFrame {
  scene_id: number;
  time_range: string;
  frame_title: string;
  visual_description: string;
  camera: string;
  mood: string;
  color_palette: string[];
  key_element: string;
  duration: number;
}

export interface VideoResult {
  type: "video" | "storyboard";
  url?: string;
  video_url?: string | null;
  frames?: string[] | null;
  storyboard?: StoryboardFrame[];
  scenes: DirectedScene[];
  tier: "veo3" | "fallback" | "demo";
  banner?: string;
  storyboard_cards?: StoryboardCard[];
}

export interface StoryboardCard {
  scene_id: number;
  tab_label: string;
  summary: string;
  camera: string;
  motion: string;
  audio: string;
  on_screen_text: string;
}

export interface NeuralScores {
  visual_cortex_engagement: number;
  auditory_cortex_engagement: number;
  prefrontal_attention: number;
  amygdala_emotional_arousal: number;
  hippocampal_memory_encoding: number;
  overall_engagement: number;
}

export type NeuralMetricKey = keyof NeuralScores;

export interface NeuralSegment {
  scene_id: number;
  time_start: number;
  time_end: number;
  neural_scores: NeuralScores;
  peak_moment: string;
  drop_moment: string;
  predicted_recall_probability: number;
  signal_confidence?: number;
  dominant_driver?: "visual" | "audio" | "copy" | "emotion" | "product" | "pacing";
  honesty_note?: string;
}

export interface NeuralOverall {
  mean_engagement: number;
  engagement_arc: "rising" | "plateau" | "declining" | "volatile";
  emotional_valence: "positive" | "negative" | "mixed" | "neutral";
  memory_strength: number;
  attention_retention: number;
  neural_grade: "A" | "B" | "C" | "D" | "F";
  benchmark_percentile: number;
  standout_signal?: string;
  score_confidence?: number;
  data_quality?: "high" | "medium" | "low";
  best_leverage_point?: string;
  uncertainty_note?: string;
}

export interface NeuralPrediction {
  label: "TRIBE v2-calibrated prediction";
  segments: NeuralSegment[];
  overall: NeuralOverall;
  mode: "live" | "demo";
}

export interface Insight {
  id: string;
  title: string;
  finding: string;
  recommendation: string;
  impact: "high" | "medium" | "low";
  metric_affected: string;
  scene_ref: number;
}

export interface RewriteSuggestion {
  scene_id: number;
  original_line: string;
  rewritten_line: string;
  reason: string;
}

export interface HeadlineTestEntry {
  headline: string;
  predicted_recall_score: number;
  why: string;
}

export interface InsightResult {
  insights: Insight[];
  rewrite_suggestion: RewriteSuggestion | null;
  headline_test: HeadlineTestEntry[];
  overall_verdict: string;
  engagement_arc_explanation: string;
}

export interface InsightEvaluationIssue {
  code:
    | "duplicate_insight"
    | "insight_count"
    | "missing_rewrite"
    | "missing_headline_test"
    | "blank_field"
    | "invalid_scene_ref";
  message: string;
  severity: "info" | "warning" | "error";
  insight_id?: string;
}

export interface InsightEvaluationResult {
  status: "pass" | "warn";
  neural_valid: boolean;
  insights_valid: boolean;
  neural_issues: string[];
  insights_issues: string[];
  score: number;
  quality_score: number;
  insight_count: number;
  unique_insight_count: number;
  duplicate_count: number;
  needs_retry: boolean;
  summary: string;
  recommendation: string;
  issues: InsightEvaluationIssue[];
}

export interface PipelineResult {
  runId: string;
  title?: string;
  ad_category?: string;
  expanded: ScriptExpansion;
  directed: DirectedScene[];
  audio: AudioResult;
  video: VideoResult;
  neural: NeuralPrediction;
  insights: InsightResult;
  evaluation?: InsightEvaluationResult;
  completedAt: string;
}

export interface AgentEventPayload {
  agent: AgentName;
  status: AgentStatus;
  progress: number;
  message: string;
  data?: unknown;
  scenes_complete?: number;
  total?: number;
}

export interface PipelineEvent extends AgentEventPayload {
  runId: string;
  timestamp: string;
  type?: "agent_event" | "pipeline_complete" | "pipeline_error";
  error?: string;
}

export interface StartPipelineRequest {
  script: string;
  fileId?: string;
  uploadType?: UploadType;
}

export interface StartPipelineResponse {
  runId: string;
}

export interface ResultsResponse {
  result: PipelineResult | null;
  title?: string;
  ad_category?: string;
  neural?: NeuralPrediction;
  insights?: InsightResult;
  video?: VideoResult;
  evaluation?: InsightEvaluationResult;
}
