"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import type { StoryboardFrame, VideoResult } from "@/lib/types";

export function VideoPreview(props: { result: VideoResult | null }): JSX.Element | null {
  const [activeScene, setActiveScene] = useState(0);

  if (!props.result?.storyboard || props.result.storyboard.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-secondary)]">
        Scene previews will appear here once the preview step finishes.
      </div>
    );
  }

  const frames: StoryboardFrame[] = props.result.storyboard;
  const currentIndex = Math.min(activeScene, frames.length - 1);
  const active = frames[currentIndex];

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Scene preview</p>
          <p className="text-xs text-[var(--text-muted)]">{frames.length} scenes · AI-generated storyboard</p>
        </div>
        <span className="rounded-full border border-[var(--accent-primary)]/20 bg-[var(--accent-glow)] px-3 py-1 text-xs text-[var(--accent-primary)]">
          PREVIEW
        </span>
      </div>

      <div className="flex min-h-[320px] flex-col md:flex-row">
        <div className="w-full border-b border-[var(--border)] md:w-48 md:border-b-0 md:border-r">
          {frames.map((frame, index) => (
            <button
              key={`${frame.scene_id}-${index}`}
              type="button"
              onClick={() => setActiveScene(index)}
              className={`w-full border-b border-[var(--border)] px-4 py-3 text-left transition-colors ${
                index === currentIndex
                  ? "border-l-2 border-l-[var(--accent-primary)] bg-[var(--bg-elevated)]"
                  : "border-l-2 border-l-transparent hover:bg-[var(--bg-elevated)]"
              }`}
            >
              <p className="text-xs font-medium text-[var(--accent-primary)]">Scene {frame.scene_id}</p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{frame.time_range}</p>
              <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">{frame.frame_title}</p>
            </button>
          ))}
        </div>

        <motion.div
          key={`${active.scene_id}-${currentIndex}`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 p-6"
        >
          <div className="mb-4 flex h-24 w-full overflow-hidden rounded-lg">
            {(active.color_palette ?? ["#1a1a1a", "#0d0d0d", "#111"]).map((color, index) => (
              <div key={`${color}-${index}`} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>

          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-base font-medium text-[var(--text-primary)]">{active.frame_title}</h3>
            <span className="shrink-0 rounded bg-[var(--bg-elevated)] px-2 py-1 text-xs text-[var(--text-muted)]">{active.mood}</span>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">{active.visual_description}</p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-[var(--bg-elevated)] p-3">
              <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Camera</p>
              <p className="text-xs text-[var(--text-secondary)]">{active.camera}</p>
            </div>
            <div className="rounded-lg bg-[var(--bg-elevated)] p-3">
              <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Key element</p>
              <p className="text-xs text-[var(--text-secondary)]">{active.key_element}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
