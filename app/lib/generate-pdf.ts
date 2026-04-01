import jsPDF from "jspdf";

import type { InsightResult, NeuralPrediction, PipelineResult } from "@/lib/types";

const C = {
  bg: [10, 10, 10] as [number, number, number],
  surface: [17, 17, 17] as [number, number, number],
  elevated: [26, 26, 26] as [number, number, number],
  accent: [0, 255, 136] as [number, number, number],
  accentBg: [13, 32, 22] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  amber: [249, 115, 22] as [number, number, number],
  white: [248, 250, 252] as [number, number, number],
  muted: [136, 136, 136] as [number, number, number],
  dim: [85, 85, 85] as [number, number, number],
  border: [30, 30, 30] as [number, number, number]
};

export interface AnalysisPdfSnapshot {
  runId: string;
  title?: string | null;
  category?: string | null;
  generatedAt?: string | null;
  script?: string | null;
  prediction?: NeuralPrediction | null;
  insights?: InsightResult | null;
  evaluation?: PipelineResult["evaluation"] | null;
}

function rgb(pdf: jsPDF, color: [number, number, number], mode: "fill" | "stroke" | "text"): void {
  if (mode === "fill") pdf.setFillColor(color[0], color[1], color[2]);
  if (mode === "stroke") pdf.setDrawColor(color[0], color[1], color[2]);
  if (mode === "text") pdf.setTextColor(color[0], color[1], color[2]);
}

function newPage(pdf: jsPDF): void {
  pdf.addPage();
  rgb(pdf, C.bg, "fill");
  pdf.rect(0, 0, 210, 297, "F");
}

function scoreBar(pdf: jsPDF, x: number, y: number, w: number, h: number, value: number): void {
  rgb(pdf, C.elevated, "fill");
  pdf.roundedRect(x, y, w, h, h / 2, h / 2, "F");
  const fillW = w * Math.min(1, Math.max(0, value));
  const fillColor: [number, number, number] = value >= 0.7 ? C.accent : value >= 0.45 ? C.amber : C.danger;
  rgb(pdf, fillColor, "fill");
  pdf.roundedRect(x, y, Math.max(fillW, h), h, h / 2, h / 2, "F");
}

function gradeColor(grade: string): [number, number, number] {
  if (grade === "A") return C.accent;
  if (grade === "B") return [34, 197, 94];
  if (grade === "C") return C.amber;
  if (grade === "D" || grade === "F") return C.danger;
  return C.muted;
}

function impactColor(impact: string): [number, number, number] {
  if (impact === "high") return C.accent;
  if (impact === "medium") return C.amber;
  return C.muted;
}

function addWrappedText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  color: [number, number, number],
  bold = false
): number {
  pdf.setFontSize(size);
  rgb(pdf, color, "text");
  pdf.setFont("helvetica", bold ? "bold" : "normal");
  const lines = pdf.splitTextToSize(text || "", maxWidth);
  pdf.text(lines, x, y);
  return lines.length * size * 0.42;
}

function toFileSafe(value: string): string {
  return (value || "analysis")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 40) || "analysis";
}

export function getPdfFileName(title: string | null | undefined, grade: string | null | undefined): string {
  const safeTitle = toFileSafe(title ?? "analysis");
  const safeGrade = (grade ?? "na").replace(/[^a-z0-9]/gi, "").toLowerCase() || "na";
  return `${safeTitle}_advertisement_${safeGrade}.pdf`;
}

function getSegments(result: any): any[] {
  return result?.neural?.segments ?? result?.prediction?.segments ?? [];
}

function getInsights(result: any): any[] {
  return result?.insights?.insights ?? [];
}

function getOverall(result: any): any {
  return result?.neural?.overall ?? result?.prediction?.overall ?? {};
}

function getEvaluation(result: any): PipelineResult["evaluation"] | null {
  return result?.evaluation ?? null;
}

function getTitle(result: any): string {
  return result?.title ?? "Ad Analysis";
}

function getCategory(result: any): string {
  return result?.ad_category ?? result?.category ?? "General";
}

function getScript(result: any): string {
  return result?.expanded?.full_voiceover_script ?? result?.script ?? "";
}

function drawCover(pdf: jsPDF, result: any): void {
  const overall = getOverall(result);
  const grade = overall?.neural_grade ?? "—";
  const pct = overall?.benchmark_percentile ?? 0;
  const mean = Math.round((overall?.mean_engagement ?? 0) * 100);
  const mem = Math.round((overall?.memory_strength ?? 0) * 100);
  const attn = Math.round((overall?.attention_retention ?? 0) * 100);

  rgb(pdf, C.bg, "fill");
  pdf.rect(0, 0, 210, 297, "F");
  rgb(pdf, C.accent, "fill");
  pdf.rect(0, 0, 210, 3, "F");

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  rgb(pdf, C.accent, "text");
  pdf.text("NEURODRAFT", 16, 22);
  pdf.setFont("helvetica", "normal");
  rgb(pdf, C.dim, "text");
  pdf.text("Neural analysis report", 16, 28);

  rgb(pdf, C.dim, "text");
  pdf.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), 194, 22, { align: "right" });
  pdf.text(getCategory(result), 194, 28, { align: "right" });

  rgb(pdf, C.border, "stroke");
  pdf.setLineWidth(0.3);
  pdf.line(16, 34, 194, 34);

  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  rgb(pdf, C.white, "text");
  const titleLines = pdf.splitTextToSize(getTitle(result), 178);
  pdf.text(titleLines, 16, 54);

  const cx = 157;
  const cy = 90;
  const r = 28;
  rgb(pdf, C.surface, "fill");
  pdf.circle(cx, cy, r, "F");
  rgb(pdf, gradeColor(grade), "stroke");
  pdf.setLineWidth(2);
  pdf.circle(cx, cy, r, "S");
  pdf.setFontSize(32);
  pdf.setFont("helvetica", "bold");
  rgb(pdf, gradeColor(grade), "text");
  pdf.text(grade, cx, cy + 5, { align: "center" });
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  rgb(pdf, C.dim, "text");
  pdf.text("NEURAL GRADE", cx, cy + r + 7, { align: "center" });

  const stats = [
    { label: "MEAN ENGAGEMENT", value: `${mean}%` },
    { label: "MEMORY STRENGTH", value: `${mem}%` },
    { label: "ATTENTION", value: `${attn}%` },
    { label: "BENCHMARK", value: `${pct}th pct` }
  ];
  const bx = 16;
  const by = 110;
  const bw = 40;
  const bh = 24;
  const gap = 4;
  stats.forEach((s, i) => {
    const x = bx + i * (bw + gap);
    rgb(pdf, C.surface, "fill");
    pdf.roundedRect(x, by, bw, bh, 3, 3, "F");
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "normal");
    rgb(pdf, C.dim, "text");
    pdf.text(s.label, x + bw / 2, by + 7, { align: "center" });
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, C.white, "text");
    pdf.text(s.value, x + bw / 2, by + 18, { align: "center" });
  });

  const arc = overall?.engagement_arc ?? "";
  if (arc) {
    rgb(pdf, C.accentBg, "fill");
    pdf.roundedRect(16, 142, 60, 9, 2, 2, "F");
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, C.accent, "text");
    pdf.text(`ARC · ${String(arc).toUpperCase()}`, 46, 148, { align: "center" });
  }

  [
    { label: "SCENES", value: String(getSegments(result).length) },
    { label: "INSIGHTS", value: String(getInsights(result).length) }
  ].forEach((s, i) => {
    const x = 16 + i * 46;
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "normal");
    rgb(pdf, C.dim, "text");
    pdf.text(s.label, x, 160);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, C.white, "text");
    pdf.text(s.value, x, 170);
  });

  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  rgb(pdf, C.dim, "text");
  pdf.text("SOURCE SCRIPT", 16, 186);
  rgb(pdf, C.border, "stroke");
  pdf.setLineWidth(0.2);
  pdf.line(16, 188, 194, 188);

  const scriptLines = pdf.splitTextToSize(getScript(result), 178);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  rgb(pdf, C.muted, "text");
  pdf.text(scriptLines.slice(0, 12), 16, 195);

  rgb(pdf, C.border, "stroke");
  pdf.line(16, 283, 194, 283);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  rgb(pdf, C.dim, "text");
  pdf.text("Generated from the NeuroDraft workspace · Built on TRIBE v2 (Meta Research, 2026)", 16, 289);
  pdf.text("1", 194, 289, { align: "right" });
}

function drawHeatmap(pdf: jsPDF, result: any): void {
  newPage(pdf);
  rgb(pdf, C.accent, "fill");
  pdf.rect(16, 16, 3, 12, "F");
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  rgb(pdf, C.white, "text");
  pdf.text("Neural heatmap", 22, 25);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  rgb(pdf, C.dim, "text");
  pdf.text("Scene-by-scene scores across all six brain metrics", 22, 31);

  const metrics = [
    { key: "visual_cortex_engagement", label: "Visual" },
    { key: "auditory_cortex_engagement", label: "Auditory" },
    { key: "prefrontal_attention", label: "Attention" },
    { key: "amygdala_emotional_arousal", label: "Emotion" },
    { key: "hippocampal_memory_encoding", label: "Memory" },
    { key: "overall_engagement", label: "Overall" }
  ];

  let y = 44;
  const segments = getSegments(result);
  pdf.setFontSize(6);
  pdf.setFont("helvetica", "bold");
  rgb(pdf, C.dim, "text");
  pdf.text("SCENE", 16, y);
  pdf.text("TIME", 38, y);
  metrics.forEach((m, i) => pdf.text(m.label.toUpperCase(), 62 + i * 22, y, { align: "center" }));
  pdf.text("GRADE", 182, y, { align: "center" });
  y += 3;
  rgb(pdf, C.border, "stroke");
  pdf.line(16, y, 194, y);
  y += 5;

  segments.forEach((seg: any, si: number) => {
    if (y > 265) {
      newPage(pdf);
      y = 24;
    }
    const rowH = 18;
    if (si % 2 === 0) {
      rgb(pdf, C.surface, "fill");
      pdf.rect(16, y - 3, 178, rowH, "F");
    }

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, C.white, "text");
    pdf.text(`Scene ${seg.scene_id}`, 16, y + 4);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    rgb(pdf, C.dim, "text");
    pdf.text(`${seg.time_start}–${seg.time_end}s`, 38, y + 4);

    metrics.forEach((m, mi) => {
      const val = seg.neural_scores?.[m.key] ?? 0;
      const bx = 52 + mi * 22;
      const by = y + 1;
      scoreBar(pdf, bx, by, 18, 4, val);
      pdf.setFontSize(6);
      rgb(pdf, C.muted, "text");
      pdf.text(`${Math.round(val * 100)}%`, bx + 9, by + 8, { align: "center" });
    });

    const overall = seg.neural_scores?.overall_engagement ?? 0;
    const sceneGrade = overall >= 0.78 ? "A" : overall >= 0.6 ? "B" : overall >= 0.45 ? "C" : "D";
    rgb(pdf, C.elevated, "fill");
    pdf.roundedRect(178, y, 16, 8, 2, 2, "F");
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, gradeColor(sceneGrade), "text");
    pdf.text(sceneGrade, 186, y + 5.5, { align: "center" });

    y += rowH + 2;
    if (seg.peak_moment) {
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      rgb(pdf, C.accent, "text");
      pdf.text(pdf.splitTextToSize(`↑ ${seg.peak_moment}`, 120).slice(0, 1), 18, y);
      y += 4;
    }
    if (seg.drop_moment) {
      rgb(pdf, C.danger, "text");
      pdf.text(pdf.splitTextToSize(`↓ ${seg.drop_moment}`, 120).slice(0, 1), 18, y);
      y += 6;
    }
    y += 4;
  });

  pdf.setFontSize(7);
  rgb(pdf, C.dim, "text");
  pdf.text("2", 194, 289, { align: "right" });
}

function drawReadout(pdf: jsPDF, result: any): void {
  newPage(pdf);
  rgb(pdf, C.accent, "fill");
  pdf.rect(16, 16, 3, 12, "F");
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  rgb(pdf, C.white, "text");
  pdf.text("Neural readout", 22, 25);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  rgb(pdf, C.dim, "text");
  pdf.text("TRIBE v2 scores translated into plain creative direction", 22, 31);

  const translations: Record<string, { name: string; low: string; mid: string; high: string }> = {
    visual_cortex_engagement: { name: "Visual attention", low: "Visuals are not holding the eye.", mid: "Adequate visual engagement.", high: "Strong visual pull — viewers are locked on." },
    auditory_cortex_engagement: { name: "Sound impact", low: "Audio is not reinforcing the message.", mid: "Audio is present but not amplifying.", high: "Sound and visuals work together — cohesive." },
    prefrontal_attention: { name: "Conscious attention", low: "Viewers likely zone out here.", mid: "Attention is fragile — any distraction loses the viewer.", high: "Viewers are actively following the story." },
    amygdala_emotional_arousal: { name: "Emotional response", low: "Scene is emotionally flat.", mid: "Mild emotional engagement.", high: "Viewers are feeling something — warmth, excitement, or humor." },
    hippocampal_memory_encoding: { name: "Memory strength", low: "Viewers will likely not recall this tomorrow.", mid: "Moderate recall likelihood.", high: "This scene will be remembered." },
    overall_engagement: { name: "Overall brain engagement", low: "Brain is in passive mode.", mid: "Ad is watched but not fully absorbed.", high: "High engagement — brain is active and receptive." }
  };

  const segments = getSegments(result);
  const averages: Record<string, number> = {};
  Object.keys(translations).forEach((k) => {
    averages[k] = segments.length
      ? segments.reduce((sum: number, s: any) => sum + (s.neural_scores?.[k] ?? 0), 0) / segments.length
      : 0;
  });

  let y = 44;
  const cardW = 86;
  const cardH = 32;
  const gap = 6;
  let col = 0;

  Object.entries(translations).forEach(([key, def]) => {
    const val = averages[key] ?? 0;
    const level = val >= 0.7 ? "high" : val >= 0.45 ? "mid" : "low";
    const levelLabel = val >= 0.7 ? "STRONG" : val >= 0.45 ? "FAIR" : "WEAK";
    const levelColor: [number, number, number] = val >= 0.7 ? C.accent : val >= 0.45 ? C.amber : C.danger;
    const x = 16 + col * (cardW + gap);

    rgb(pdf, C.surface, "fill");
    pdf.roundedRect(x, y, cardW, cardH, 3, 3, "F");
    rgb(pdf, levelColor, "fill");
    pdf.roundedRect(x + cardW - 20, y + 4, 16, 5, 1, 1, "F");
    pdf.setFontSize(5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(levelLabel, x + cardW - 12, y + 7.5, { align: "center" });

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, C.white, "text");
    pdf.text(def.name, x + 4, y + 11);
    scoreBar(pdf, x + 4, y + 14, cardW - 8, 3, val);
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "normal");
    rgb(pdf, C.dim, "text");
    pdf.text(`${Math.round(val * 100)}%`, x + cardW - 4, y + 17, { align: "right" });
    rgb(pdf, C.muted, "text");
    pdf.text(pdf.splitTextToSize(def[level as "low" | "mid" | "high"], cardW - 8).slice(0, 2), x + 4, y + 22);

    col += 1;
    if (col >= 2) {
      col = 0;
      y += cardH + gap;
    }
  });

  y += 16;
  if (result?.insights?.overall_verdict) {
    rgb(pdf, C.accentBg, "fill");
    pdf.roundedRect(16, y, 178, 2, 1, 1, "F");
    y += 6;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, C.accent, "text");
    pdf.text("Overall verdict", 16, y);
    y += 6;
    y += addWrappedText(pdf, result.insights.overall_verdict, 16, y, 178, 9, C.white) + 8;
    if (result.insights.engagement_arc_explanation) {
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      rgb(pdf, C.dim, "text");
      pdf.text(`Engagement arc · ${String(getOverall(result)?.engagement_arc ?? "").toUpperCase()}`, 16, y);
      y += 5;
      addWrappedText(pdf, result.insights.engagement_arc_explanation, 16, y, 178, 8, C.muted);
      y += 12;
    }
  }

  const evaluation = getEvaluation(result);
  if (evaluation?.score !== undefined) {
    const qScore = evaluation.score;
    const qColor = qScore >= 80 ? C.accent : qScore >= 60 ? C.amber : C.danger;
    rgb(pdf, C.surface, "fill");
    pdf.roundedRect(16, y, 178, 14, 3, 3, "F");
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, C.dim, "text");
    pdf.text("QUALITY VERIFICATION", 20, y + 6);
    pdf.setFontSize(11);
    rgb(pdf, qColor, "text");
    pdf.text(`${qScore}/100`, 194, y + 9, { align: "right" });
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "normal");
    rgb(pdf, C.dim, "text");
    pdf.text(qScore >= 80 ? "All checks passed" : qScore >= 60 ? "Accepted with minor issues" : "Below threshold — indicative only", 20, y + 11);
  }

  pdf.setFontSize(7);
  rgb(pdf, C.dim, "text");
  pdf.text("3", 194, 289, { align: "right" });
}

function drawInsights(pdf: jsPDF, result: any): void {
  newPage(pdf);
  rgb(pdf, C.accent, "fill");
  pdf.rect(16, 16, 3, 12, "F");
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  rgb(pdf, C.white, "text");
  pdf.text("Creative direction", 22, 25);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  rgb(pdf, C.dim, "text");
  pdf.text("Five insights with findings and specific recommendations", 22, 31);

  let y = 44;
  getInsights(result).forEach((insight: any) => {
    if (y > 240) {
      newPage(pdf);
      y = 24;
    }

    const cardH = 36;
    const iColor = impactColor(insight.impact ?? "low");
    rgb(pdf, C.surface, "fill");
    pdf.roundedRect(16, y, 178, cardH, 3, 3, "F");
    rgb(pdf, iColor, "fill");
    pdf.roundedRect(16, y, 3, cardH, 1, 1, "F");
    rgb(pdf, iColor, "fill");
    pdf.roundedRect(22, y + 4, 18, 5, 1, 1, "F");
    pdf.setFontSize(5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(String(insight.impact ?? "").toUpperCase(), 31, y + 7, { align: "center" });
    pdf.setFontSize(5);
    pdf.setFont("helvetica", "normal");
    rgb(pdf, C.dim, "text");
    pdf.text(insight.metric_affected ?? "", 44, y + 7);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, C.white, "text");
    pdf.text(insight.title ?? "", 22, y + 16);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    rgb(pdf, C.muted, "text");
    pdf.text(pdf.splitTextToSize(insight.finding ?? "", 170).slice(0, 1), 22, y + 23);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, iColor, "text");
    pdf.text(pdf.splitTextToSize(`→ ${insight.recommendation ?? ""}`, 170).slice(0, 1), 22, y + 29);
    y += cardH + 4;
  });

  const rw = result?.insights?.rewrite_suggestion;
  if (rw && y < 250) {
    y += 4;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, C.white, "text");
    pdf.text("Rewrite suggestion", 16, y);
    y += 6;
    rgb(pdf, C.surface, "fill");
    pdf.roundedRect(16, y, 178, 30, 3, 3, "F");
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, C.danger, "text");
    pdf.text("ORIGINAL", 20, y + 7);
    pdf.setFont("helvetica", "normal");
    rgb(pdf, C.muted, "text");
    pdf.text(pdf.splitTextToSize(`"${rw.original_line ?? ""}"`, 170).slice(0, 1), 20, y + 13);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, C.accent, "text");
    pdf.text("IMPROVED", 20, y + 20);
    pdf.setFont("helvetica", "normal");
    rgb(pdf, C.white, "text");
    pdf.text(pdf.splitTextToSize(`"${rw.rewritten_line ?? ""}"`, 170).slice(0, 1), 20, y + 26);
    y += 34;
  }

  const ht = result?.insights?.headline_test ?? [];
  if (ht.length > 0 && y < 260) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    rgb(pdf, C.white, "text");
    pdf.text("Headline recall test", 16, y);
    y += 6;
    [...ht].sort((a: any, b: any) => b.predicted_recall_score - a.predicted_recall_score).forEach((h: any, i: number) => {
      if (y > 275) return;
      rgb(pdf, C.surface, "fill");
      pdf.roundedRect(16, y, 178, 12, 2, 2, "F");
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      rgb(pdf, i === 0 ? C.accent : C.muted, "text");
      pdf.text(String(h.predicted_recall_score), 22, y + 8);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", i === 0 ? "bold" : "normal");
      rgb(pdf, i === 0 ? C.white : C.muted, "text");
      pdf.text(h.headline ?? "", 34, y + 8);
      if (i === 0) {
        pdf.setFontSize(5);
        rgb(pdf, C.accent, "text");
        pdf.text("BEST RECALL", 190, y + 7, { align: "right" });
      }
      y += 15;
    });
  }

  pdf.setFontSize(7);
  rgb(pdf, C.dim, "text");
  pdf.text("4", 194, 289, { align: "right" });
}

function buildSnapshotResult(snapshot: AnalysisPdfSnapshot): any {
  return {
    title: snapshot.title ?? "Ad Analysis",
    category: snapshot.category ?? "General",
    prediction: snapshot.prediction,
    insights: snapshot.insights,
    evaluation: snapshot.evaluation,
    script: snapshot.script ?? "",
    generatedAt: snapshot.generatedAt ?? new Date().toISOString()
  };
}

export function createResultPdfReport(result: PipelineResult): PipelineResult {
  return result;
}

export function createAnalysisPdfReport(snapshot: AnalysisPdfSnapshot): any {
  return buildSnapshotResult(snapshot);
}

export async function downloadPdf(input: any, filename?: string): Promise<void> {
  await generatePDF(input, filename);
}

export async function generatePDF(result: any, filename?: string): Promise<void> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  drawCover(pdf, result);
  drawHeatmap(pdf, result);
  drawReadout(pdf, result);
  drawInsights(pdf, result);

  const safeName = filename ?? getPdfFileName(getTitle(result), getOverall(result)?.neural_grade ?? null);
  const finalFilename = safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`;
  pdf.save(finalFilename);
}
