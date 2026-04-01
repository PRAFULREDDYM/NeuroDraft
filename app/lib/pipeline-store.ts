"use client";

import { create } from "zustand";

import type {
  AgentStatus,
  AudioResult,
  InsightResult,
  NeuralPrediction,
  ScriptExpansion,
  VideoResult
} from "@/lib/types";

interface AgentState {
  status: AgentStatus;
  progress: number;
  message: string;
  data?: unknown;
}

export interface PipelineStore {
  runId: string | null;
  agents: Record<string, AgentState>;
  videoResult: VideoResult | null;
  audioResult: AudioResult | null;
  neuralPrediction: NeuralPrediction | null;
  insights: InsightResult | null;
  scriptExpansion: ScriptExpansion | null;
  setRunId: (id: string) => void;
  updateAgent: (agent: string, state: Partial<AgentState>) => void;
  setVideoResult: (video: VideoResult) => void;
  setAudioResult: (audio: AudioResult) => void;
  setNeuralPrediction: (prediction: NeuralPrediction) => void;
  setInsights: (insights: InsightResult) => void;
  setScriptExpansion: (script: ScriptExpansion) => void;
  reset: () => void;
}

const initialAgents: Record<string, AgentState> = {
  SCRIPT_EXPANDER: { status: "idle", progress: 0, message: "Awaiting script" },
  SCENE_DIRECTOR: { status: "idle", progress: 0, message: "Waiting for scenes" },
  VIDEO_SYNTHESIZER: { status: "idle", progress: 0, message: "Waiting for direction" },
  AUDIO_SYNTHESIZER: { status: "idle", progress: 0, message: "Ready for transcript timing" },
  TRIBE_PREDICTOR: { status: "idle", progress: 0, message: "Awaiting multimodal inputs" },
  INSIGHT_WRITER: { status: "idle", progress: 0, message: "Awaiting neural scores" },
  EVALUATOR: { status: "idle", progress: 0, message: "Awaiting insight quality check" }
};

export const usePipelineStore = create<PipelineStore>((set) => ({
  runId: null,
  agents: initialAgents,
  videoResult: null,
  audioResult: null,
  neuralPrediction: null,
  insights: null,
  scriptExpansion: null,
  setRunId: (id) => set({ runId: id }),
  updateAgent: (agent, state) =>
    set((current) => ({
      agents: {
        ...current.agents,
        [agent]: {
          ...current.agents[agent],
          ...state
        }
      }
    })),
  setVideoResult: (videoResult) => set({ videoResult }),
  setAudioResult: (audioResult) => set({ audioResult }),
  setNeuralPrediction: (neuralPrediction) => set({ neuralPrediction }),
  setInsights: (insights) => set({ insights }),
  setScriptExpansion: (scriptExpansion) => set({ scriptExpansion }),
  reset: () =>
    set({
      runId: null,
      agents: initialAgents,
      videoResult: null,
      audioResult: null,
      neuralPrediction: null,
      insights: null,
      scriptExpansion: null
    })
}));
