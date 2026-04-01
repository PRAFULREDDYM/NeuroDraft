"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type ChangeEvent } from "react";

import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LoaderCircle, Sparkles, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { createDemoAudioResult, createDemoDirectedScenes, createDemoInsights, createDemoNeuralPrediction, createDemoScriptExpansion, createDemoVideoResult } from "@/lib/mock-data";
import { usePipelineStore } from "@/lib/pipeline-store";
import type {
  AudioResult,
  DirectedScene,
  InsightResult,
  NeuralPrediction,
  PipelineResult,
  ScriptExpansion,
  StartPipelineResponse,
  UploadType,
  VideoResult
} from "@/lib/types";

type Mode = "script" | "rough-cut" | "final-video";

type UploadState =
  | { status: "idle"; progress: number; fileId: null; uploadType: null; fileName: null; error: null }
  | { status: "uploading"; progress: number; fileId: null; uploadType: Mode; fileName: string; error: null }
  | { status: "done"; progress: 100; fileId: string; uploadType: UploadType; fileName: string; error: null }
  | { status: "error"; progress: number; fileId: null; uploadType: Mode; fileName: string | null; error: string };

const starterScript = "Happy family. Morning light. Our cereal pours into bowls with real ingredients and a bright smile. VO: Real ingredients, real you.";

function fallbackResult(script: string, runId: string): {
  result: PipelineResult;
  expanded: ScriptExpansion;
  directed: DirectedScene[];
  audio: AudioResult;
  video: VideoResult;
  neural: NeuralPrediction;
  insights: InsightResult;
} {
  const expanded = createDemoScriptExpansion(script);
  const directed = createDemoDirectedScenes(expanded);
  const audio = createDemoAudioResult(expanded.full_voiceover_script, expanded.duration_seconds);
  const video = createDemoVideoResult(directed);
  const neural = createDemoNeuralPrediction(directed);
  const insights = createDemoInsights(neural, expanded);
  const result: PipelineResult = {
    runId,
    expanded,
    directed,
    audio,
    video,
    neural,
    insights,
    completedAt: new Date().toISOString()
  };
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`neurodraft-demo-${runId}`, JSON.stringify(result));
  }
  return { result, expanded, directed, audio, video, neural, insights };
}

async function startPipeline(
  script: string,
  upload?: { fileId: string; uploadType: UploadType }
): Promise<StartPipelineResponse> {
  const response = await fetch("/api/pipeline/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      script,
      fileId: upload?.fileId,
      uploadType: upload?.uploadType
    })
  });

  if (!response.ok) {
    throw new Error("Pipeline start failed");
  }

  return (await response.json()) as StartPipelineResponse;
}

export function AgentOrchestrator(props: { initialScript?: string }): JSX.Element {
  const [script, setScript] = useState(props.initialScript ?? starterScript);
  const [mode, setMode] = useState<Mode>("script");
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    fileId: null,
    uploadType: null,
    fileName: null,
    error: null
  });
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const setRunId = usePipelineStore((state) => state.setRunId);
  const reset = usePipelineStore((state) => state.reset);

  const mutation = useMutation({
    mutationFn: async (payload: { script: string; upload?: { fileId: string; uploadType: UploadType } }) =>
      startPipeline(payload.script, payload.upload),
    onSuccess: (data) => {
      setRunId(data.runId);
      window.setTimeout(() => {
        scrollToPipeline();
      }, 300);
    },
    onError: () => {
      const runId = `demo-${Date.now()}`;
      setRunId(runId);
      fallbackResult(script, runId);
    }
  });

  useEffect(() => {
    if (props.initialScript) {
      setScript(props.initialScript);
    }
  }, [props.initialScript]);

  const wordCount = useMemo(() => script.trim().split(/\s+/).filter(Boolean).length, [script]);

  function scrollToPipeline(): void {
    const target = document.getElementById("pipeline-state");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleFileUpload(file: File, nextMode: Exclude<Mode, "script">): void {
    setUploadState({
      status: "uploading",
      progress: 5,
      fileId: null,
      uploadType: nextMode,
      fileName: file.name,
      error: null
    });

    const request = new XMLHttpRequest();
    request.open("POST", "/api/upload");
    request.responseType = "json";

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const progress = Math.max(5, Math.min(95, Math.round((event.loaded / event.total) * 100)));
      setUploadState((current) =>
        current.status === "uploading"
          ? {
              ...current,
              progress
            }
          : current
      );
    };

    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        setUploadState({
          status: "error",
          progress: 0,
          fileId: null,
          uploadType: nextMode,
          fileName: file.name,
          error: "Upload failed. Please try again."
        });
        return;
      }

      const response = request.response as
        | {
            fileId?: string;
            uploadType?: UploadType;
            fileName?: string;
          }
        | null;

      const fileId = response?.fileId;
      const uploadType = response?.uploadType ?? nextMode;
      const fileName = response?.fileName ?? file.name;

      if (!fileId) {
        setUploadState({
          status: "error",
          progress: 0,
          fileId: null,
          uploadType: nextMode,
          fileName,
          error: "Upload completed without an id."
        });
        return;
      }

      setUploadState({
        status: "done",
        progress: 100,
        fileId,
        uploadType,
        fileName,
        error: null
      });
      setMode(uploadType);
    };

    request.onerror = () => {
      setUploadState({
        status: "error",
        progress: 0,
        fileId: null,
        uploadType: nextMode,
        fileName: file.name,
        error: "Upload failed. Please try again."
      });
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", nextMode);
    request.send(formData);
  }

  function handleUploadClick(nextMode: Exclude<Mode, "script">): void {
    setMode(nextMode);
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const nextMode = (mode === "script" ? "rough-cut" : mode) as Exclude<Mode, "script">;
    handleFileUpload(file, nextMode);
    event.target.value = "";
  }

  function handleSubmit(): void {
    scrollToPipeline();
    reset();
    startTransition(() => {
      mutation.mutate({
        script,
        upload:
          uploadState.status === "done"
            ? {
                fileId: uploadState.fileId,
                uploadType: uploadState.uploadType
              }
            : undefined
      });
    });
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Script input</CardTitle>
          <CardDescription className="mt-2 max-w-xl">
            Paste the ad script or upload a rough cut to enrich the scene preview and neural readout.
          </CardDescription>
        </div>
        <Sparkles className="h-5 w-5 text-[var(--accent-primary)]" />
      </CardHeader>

      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          aria-label="Upload video file"
          onChange={handleFileChange}
        />

        <div className="grid h-auto w-full grid-cols-3 rounded-3xl border border-[var(--border)] bg-black/40 p-1">
          <Button
            type="button"
            variant={mode === "script" ? "default" : "ghost"}
            onClick={() => {
              setMode("script");
              setUploadState({
                status: "idle",
                progress: 0,
                fileId: null,
                uploadType: null,
                fileName: null,
                error: null
              });
            }}
            aria-label="Script only mode"
            className="rounded-full"
          >
            Script only
          </Button>

          {[
            { id: "rough-cut", label: "+ Upload rough cut" },
            { id: "final-video", label: "+ Upload final video" }
          ].map((option) => (
            <Button
              key={option.id}
              type="button"
              variant={mode === option.id ? "default" : "ghost"}
              aria-label={option.label}
              className="rounded-full text-[var(--text-secondary)]"
              onClick={() => handleUploadClick(option.id as Exclude<Mode, "script">)}
            >
              <Upload className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
              {option.label}
            </Button>
          ))}
        </div>

        {uploadState.status === "uploading" ? (
          <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-black/30 p-4">
            <div className="flex items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
              <span>Uploading {uploadState.uploadType === "rough-cut" ? "rough cut" : "final video"}…</span>
              <span>{uploadState.progress}%</span>
            </div>
            <Progress value={uploadState.progress} />
          </div>
        ) : null}

        {uploadState.status === "done" ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#00ff88]/20 bg-[#0d2016] p-3">
            <div className="flex min-w-0 items-center gap-3">
              <Badge className="rounded-full border border-[#0d2016] bg-[#0d2016] px-3 py-1 text-[var(--accent-primary)] hover:bg-[#0d2016]">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
                {uploadState.uploadType === "rough-cut" ? "Rough cut uploaded" : "Final video uploaded"}
              </Badge>
              <span className="truncate text-xs text-[#00ff88]">{uploadState.fileName}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setUploadState({
                  status: "idle",
                  progress: 0,
                  fileId: null,
                  uploadType: null,
                  fileName: null,
                  error: null
                });
                setMode("script");
              }}
              className="text-xs text-[#555] transition-colors hover:text-[#888]"
            >
              Remove
            </button>
          </div>
        ) : null}

        {uploadState.status === "error" ? (
          <p className="text-xs text-red-400">{uploadState.error}</p>
        ) : null}

        {mode !== "script" && uploadState.status !== "done" && uploadState.status !== "uploading" ? (
          <p className="text-xs text-[var(--text-muted)]">Select a video file to activate this mode.</p>
        ) : null}

        <Textarea
          className="border-[var(--border)]"
          value={script}
          onChange={(event) => setScript(event.target.value)}
          placeholder="Paste your ad script here. A few clear lines are enough to get a useful readout."
          aria-label="Ad script input"
        />

        <div className="mt-2 flex items-center justify-between">
          <span className={`text-xs ${wordCount >= 15 ? "text-[#555]" : "text-[#f97316]"}`}>
            {wordCount} words {wordCount < 15 ? "· Add a few more lines for best results" : ""}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          className="w-full py-3 text-sm"
          size="lg"
          onClick={handleSubmit}
          disabled={
            mutation.isPending ||
            isPending ||
            uploadState.status === "uploading" ||
            script.trim().length < 50 ||
            (mode !== "script" && uploadState.status !== "done")
          }
          aria-label="Run script analysis"
        >
          {mutation.isPending || isPending ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                className="inline-flex"
              >
                <LoaderCircle className="h-4 w-4" />
              </motion.span>
              Running analysis
            </>
          ) : (
            "Run analysis"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
