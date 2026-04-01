"use client";

import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SectionShell(props: {
  children: ReactNode;
  className?: string;
  title: string;
  eyebrow?: string;
}): JSX.Element {
  return (
    <Card className={cn(props.className)}>
      <CardHeader>
        {props.eyebrow ? <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{props.eyebrow}</p> : null}
        <CardTitle className="mt-2 text-xl font-medium tracking-tight text-[var(--text-primary)]">{props.title}</CardTitle>
      </CardHeader>
      <CardContent>{props.children}</CardContent>
    </Card>
  );
}
