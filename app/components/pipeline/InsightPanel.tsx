"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { InsightResult, NeuralOverall } from "@/lib/types";

export function InsightPanel(props: {
  engagementArc?: NeuralOverall["engagement_arc"];
  result: InsightResult | null;
}): JSX.Element {
  if (!props.result) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-[var(--text-secondary)]">
          Insights will appear once the predictor and writer finish.
        </CardContent>
      </Card>
    );
  }

  const insights = props.result.insights ?? [];
  const headlineTest = [...(props.result.headline_test ?? [])].sort(
    (left, right) => right.predicted_recall_score - left.predicted_recall_score
  );

  return (
    <Card className="overflow-hidden border-[var(--border)] bg-[var(--bg-surface)]">
      <CardContent className="p-6">
        <div className="mb-8 border-l-2 border-[var(--accent-primary)] pl-4">
          <p className="mb-1 text-sm font-medium text-[var(--accent-primary)]">Overall verdict</p>
          <p className="text-lg leading-relaxed text-[var(--text-primary)]">{props.result.overall_verdict}</p>
        </div>

        <div className="mb-8 rounded-lg bg-[var(--bg-elevated)] p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Engagement arc{props.engagementArc ? ` · ${props.engagementArc}` : ""}
          </p>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{props.result.engagement_arc_explanation}</p>
        </div>

        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={`insight-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 transition-colors hover:border-[var(--border-active)]"
            >
              <Badge
                variant={insight.impact === "high" ? "default" : "secondary"}
                className={insight.impact === "high" ? "bg-[var(--accent-primary)] text-black" : ""}
              >
                {insight.impact} impact
              </Badge>

              <h3 className="mb-1 mt-2 text-base font-medium text-[var(--text-primary)]">{insight.title}</h3>
              <p className="mb-3 text-sm text-[var(--text-secondary)]">{insight.finding}</p>

              <div className="border-t border-[var(--border)] pt-3">
                <p className="mb-1 text-xs uppercase tracking-[0.22em] text-[var(--accent-primary)]">What to do</p>
                <p className="text-sm text-[var(--text-primary)]">{insight.recommendation}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded bg-[var(--bg-elevated)] px-2 py-1 text-xs text-[var(--text-muted)]">{insight.metric_affected}</span>
                <span className="rounded bg-[var(--bg-elevated)] px-2 py-1 text-xs text-[var(--text-muted)]">Scene {insight.scene_ref}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {props.result.rewrite_suggestion ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
            <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-3">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Rewrite suggestion · Scene {props.result.rewrite_suggestion.scene_id}
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{props.result.rewrite_suggestion.reason}</p>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--destructive)]">Original</p>
                <p className="text-sm italic leading-relaxed text-[var(--text-secondary)]">
                  &quot;{props.result.rewrite_suggestion.original_line}&quot;
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--accent-primary)]">Improved</p>
                <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                  &quot;{props.result.rewrite_suggestion.rewritten_line}&quot;
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {headlineTest.length > 0 ? (
          <div className="mt-8">
            <p className="mb-4 text-sm uppercase tracking-[0.22em] text-[var(--text-muted)]">Headline recall test</p>
            <div className="space-y-3">
              {headlineTest.map((headline, index) => (
                <div key={`${headline.headline}-${index}`} className="flex items-center gap-4 rounded-lg bg-[var(--bg-elevated)] p-4">
                  <span className="w-12 text-2xl font-medium tabular-nums text-[var(--text-primary)]">
                    {headline.predicted_recall_score}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{headline.headline}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{headline.why}</p>
                  </div>
                  {index === 0 ? <Badge className="bg-[var(--accent-primary)] text-black text-xs">Best recall</Badge> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
