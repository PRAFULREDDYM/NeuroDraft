"use client";

import type { ReactNode } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AgentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusVariant: Record<AgentStatus, "default" | "secondary" | "outline" | "destructive"> = {
  idle: "secondary",
  running: "outline",
  complete: "default",
  error: "destructive",
  skipped: "secondary",
  timeout: "destructive"
};

export interface AgentCardState {
  name: string;
  icon: ReactNode;
  status: AgentStatus;
  progress: number;
  message: string;
  preview?: string;
  data?: unknown;
}

export function AgentCard(props: {
  agent: AgentCardState;
  index: number;
  compact?: boolean;
}): JSX.Element {
  const running = props.agent.status === "running";

  return (
    <BlurFade delay={0.1 * props.index}>
      <Card className={cn("relative overflow-hidden", running && "border-[var(--border-active)]")}>
        <CardContent className="flex items-start gap-3 pt-6">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
              running ? "border-[var(--accent-primary)] bg-[var(--accent-glow)]" : "border-[var(--border)] bg-[var(--bg-elevated)]"
            )}
          >
            {props.agent.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">{props.agent.name}</h3>
              <Badge variant={statusVariant[props.agent.status]} className="capitalize">
                {props.agent.status === "running" ? (
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                ) : null}
                {props.agent.status}
              </Badge>
            </div>

            <div className="mt-4">
              <Progress value={props.agent.progress} aria-label={`${props.agent.name} progress`} />
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={props.agent.message}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mt-3 text-sm leading-6 text-[var(--text-secondary)]"
              >
                {props.agent.message}
              </motion.p>
            </AnimatePresence>

            {props.agent.preview ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-secondary)]"
              >
                {props.agent.preview}
              </motion.div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  );
}
