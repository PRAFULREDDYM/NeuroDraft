"use client";

import { useMemo } from "react";

import { motion } from "framer-motion";
import { Activity, Brain, Ear, Eye, Focus, HeartPulse } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  averageMetricScore,
  getLevelConfig,
  getMetricAdMeaning,
  getMetricExplanation,
  getMetricTranslation,
  METRIC_TRANSLATIONS
} from "@/lib/neural-translations";
import type { InsightEvaluationResult, InsightResult, NeuralMetricKey, NeuralPrediction } from "@/lib/types";

const METRIC_ORDER: NeuralMetricKey[] = [
  "visual_cortex_engagement",
  "auditory_cortex_engagement",
  "prefrontal_attention",
  "amygdala_emotional_arousal",
  "hippocampal_memory_encoding",
  "overall_engagement"
];

const ICONS = {
  eye: Eye,
  ear: Ear,
  focus: Focus,
  heart: HeartPulse,
  brain: Brain,
  activity: Activity
} as const;

export function NeuralTranslator(props: {
  prediction: NeuralPrediction | null;
  insights: InsightResult | null;
  evaluation?: InsightEvaluationResult | null;
}): JSX.Element {
  const metricRows = useMemo(
    () =>
      METRIC_ORDER.map((metric) => {
        const score = averageMetricScore(props.prediction, metric);
        const translation = getMetricTranslation(metric);
        const level = getLevelConfig(score);
        const Icon = ICONS[translation.icon];

        return {
          metric,
          score,
          translation,
          level,
          Icon
        };
      }),
    [props.prediction]
  );

  const verdict = props.insights?.overall_verdict ?? "The neural readout is ready once the insight writer finishes.";
  const arcExplanation =
    props.insights?.engagement_arc_explanation ?? "Engagement arc commentary will appear after the prediction pipeline resolves.";

  if (!props.prediction) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-[var(--text-secondary)]">
          Neural translation will appear once the predictor finishes.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>What the brain data means for your ad</CardTitle>
          <CardDescription className="mt-2">
            TRIBE v2 scores translated into creative direction.
          </CardDescription>
        </div>
        <Badge variant="outline">{props.prediction.overall.neural_grade}</Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {metricRows.map((row, index) => (
            <motion.div
              key={row.metric}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full border-[var(--border)] bg-[var(--bg-surface)]">
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
                        <row.Icon className="h-4 w-4 text-[var(--accent-primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{row.translation.plainName}</p>
                        <p className="text-xs text-[var(--text-muted)]">{METRIC_TRANSLATIONS[row.metric].plainName} · {row.level.label}</p>
                      </div>
                    </div>
                    <Badge variant={row.level.label === "Peak" ? "default" : "secondary"} className={row.level.label === "Peak" ? "bg-[var(--accent-primary)] text-black" : ""}>
                      {row.level.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span className="uppercase tracking-[0.18em]">Strength</span>
                      <span>{row.level.label}</span>
                    </div>
                    <Progress value={Math.round(row.score * 100)} className="h-2" />
                  </div>

                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    {getMetricExplanation(row.metric, row.score)}
                  </p>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">What this means for your ad</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">{getMetricAdMeaning(row.metric, row.score)}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <p className="mb-2 text-sm font-medium text-[var(--accent-primary)]">Overall verdict</p>
          <p className="text-lg leading-relaxed text-[var(--text-primary)]">{verdict}</p>
        </div>

        {props.evaluation ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--accent-primary)]">Evaluator result</p>
                <p className="mt-2 text-base leading-7 text-[var(--text-primary)]">{props.evaluation.summary}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{props.evaluation.recommendation}</p>
              </div>
              <Badge variant={props.evaluation.status === "pass" ? "default" : "secondary"}>
                {props.evaluation.status.toUpperCase()}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Quality score</p>
                <p className="mt-2 text-2xl font-medium text-[var(--text-primary)] tabular">{props.evaluation.score}/100</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Insights kept</p>
                <p className="mt-2 text-2xl font-medium text-[var(--text-primary)] tabular">
                  {props.evaluation.unique_insight_count}/{props.evaluation.insight_count}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Needs retry</p>
                <p className="mt-2 text-2xl font-medium text-[var(--text-primary)]">{props.evaluation.needs_retry ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        ) : null}

        {props.prediction.overall.score_confidence !== undefined ||
        props.prediction.overall.data_quality ||
        props.prediction.overall.best_leverage_point ||
        props.prediction.overall.uncertainty_note ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--accent-primary)]">TRIBE scoring honesty</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  This block makes the model&apos;s confidence explicit so the score reads as a calibrated estimate, not certainty.
                </p>
              </div>
              {props.prediction.overall.data_quality ? (
                <Badge variant="outline">{props.prediction.overall.data_quality} data quality</Badge>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Score confidence</p>
                <p className="mt-2 text-2xl font-medium text-[var(--text-primary)] tabular">
                  {props.prediction.overall.score_confidence !== undefined
                    ? `${Math.round(props.prediction.overall.score_confidence * 100)}%`
                    : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Best leverage point</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
                  {props.prediction.overall.best_leverage_point ?? "Not enough signal to isolate a single leverage point."}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Uncertainty note</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {props.prediction.overall.uncertainty_note ?? "No extra uncertainty note was provided."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl bg-[var(--bg-surface)] p-5">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Engagement arc · {props.prediction.overall.engagement_arc}
          </p>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{arcExplanation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
