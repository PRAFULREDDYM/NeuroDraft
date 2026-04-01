"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSceneTag, summarizeSceneSegment } from "@/lib/neural-translations";
import type { NeuralPrediction } from "@/lib/types";

export function SceneSummary(props: { prediction: NeuralPrediction | null }): JSX.Element {
  if (!props.prediction) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-[var(--text-secondary)]">
          Scene summaries will appear once the predictor resolves.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Scene summary</CardTitle>
          <CardDescription className="mt-2">
            Plain English readouts for each scene in the ad.
          </CardDescription>
        </div>
        <Badge variant="outline">{props.prediction.segments.length} scenes</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {props.prediction.segments.map((segment, index) => (
          <motion.div
            key={segment.scene_id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-[var(--border)] bg-[var(--bg-surface)]">
              <CardContent className="space-y-3 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Scene {segment.scene_id} · {segment.time_start}s - {segment.time_end}s
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {summarizeSceneSegment(segment)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      getSceneTag(segment.neural_scores) === "Flat zone"
                        ? "destructive"
                        : getSceneTag(segment.neural_scores) === "Attention drop"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {getSceneTag(segment.neural_scores)}
                  </Badge>
                </div>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {segment.peak_moment}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
