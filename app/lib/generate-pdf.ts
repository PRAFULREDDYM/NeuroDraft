import type { InsightResult, NeuralPrediction, PipelineResult } from "@/lib/types";

interface PdfSection {
  title: string;
  lines: string[];
}

export interface PdfReport {
  title: string;
  category: string;
  runId: string;
  generatedAt: string;
  grade?: string;
  sections: PdfSection[];
  footer?: string;
}

export interface AnalysisPdfSnapshot {
  runId: string;
  title?: string | null;
  category?: string | null;
  generatedAt?: string | null;
  script?: string | null;
  prediction?: NeuralPrediction | null;
  insights?: InsightResult | null;
}

function asciiSafe(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfText(value: string): string {
  return asciiSafe(value).replace(/[\\()]/g, "\\$&");
}

function wrapText(value: string, maxLength: number): string[] {
  const words = asciiSafe(value).split(" ").filter(Boolean);

  if (words.length === 0) {
    return [""];
  }

  const lines: string[] = [];
  let current = words[0] ?? "";

  for (let index = 1; index < words.length; index += 1) {
    const word = words[index];
    if (!word) {
      continue;
    }

    const nextLine = `${current} ${word}`;
    if (nextLine.length > maxLength) {
      lines.push(current);
      current = word;
    } else {
      current = nextLine;
    }
  }

  lines.push(current);
  return lines;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function toSlug(value: string): string {
  const safe = asciiSafe(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return safe || "analysis";
}

function buildReportFromResult(result: PipelineResult): PdfReport {
  const title = result.title ?? result.expanded.title;
  const category = result.ad_category ?? result.expanded.brand_category;
  const sections: PdfSection[] = [
    {
      title: "Campaign summary",
      lines: [
        `Category: ${category}`,
        `Duration: ${result.expanded.duration_seconds}s`,
        `Target emotion: ${result.expanded.target_emotion}`,
        `Scenes analyzed: ${result.neural.segments.length}`,
        `Neural grade: ${result.neural.overall.neural_grade}`,
        `Mean engagement: ${formatPercent(result.neural.overall.mean_engagement)}`,
        `Memory strength: ${formatPercent(result.neural.overall.memory_strength)}`,
        `Benchmark percentile: ${result.neural.overall.benchmark_percentile}th`,
        result.neural.overall.standout_signal ? `Standout signal: ${result.neural.overall.standout_signal}` : ""
      ].filter(Boolean)
    },
    {
      title: "Overall verdict",
      lines: [
        result.insights.overall_verdict,
        `Engagement arc: ${result.neural.overall.engagement_arc}`,
        result.insights.engagement_arc_explanation
      ]
    },
    {
      title: "Scene-by-scene readout",
      lines: result.neural.segments.flatMap((segment) => [
        `Scene ${segment.scene_id} (${segment.time_start}s-${segment.time_end}s)`,
        `Visual ${formatPercent(segment.neural_scores.visual_cortex_engagement)} | Sound ${formatPercent(segment.neural_scores.auditory_cortex_engagement)} | Attention ${formatPercent(segment.neural_scores.prefrontal_attention)} | Emotion ${formatPercent(segment.neural_scores.amygdala_emotional_arousal)} | Memory ${formatPercent(segment.neural_scores.hippocampal_memory_encoding)} | Overall ${formatPercent(segment.neural_scores.overall_engagement)}`,
        `Peak: ${segment.peak_moment}`,
        `Drop: ${segment.drop_moment}`,
        `Recall probability: ${formatPercent(segment.predicted_recall_probability)}`
      ])
    },
    {
      title: "Creative direction",
      lines: result.insights.insights.flatMap((insight) => [
        `${insight.title} (${insight.impact} impact, Scene ${insight.scene_ref})`,
        `Finding: ${insight.finding}`,
        `Recommendation: ${insight.recommendation}`
      ])
    }
  ];

  if (result.insights.rewrite_suggestion) {
    sections.push({
      title: "Rewrite suggestion",
      lines: [
        `Scene ${result.insights.rewrite_suggestion.scene_id}`,
        `Original: ${result.insights.rewrite_suggestion.original_line}`,
        `Improved: ${result.insights.rewrite_suggestion.rewritten_line}`,
        `Reason: ${result.insights.rewrite_suggestion.reason}`
      ]
    });
  }

  if (result.insights.headline_test.length > 0) {
    sections.push({
      title: "Headline recall test",
      lines: result.insights.headline_test.map(
        (entry) => `${entry.headline} - ${entry.predicted_recall_score}% recall. ${entry.why}`
      )
    });
  }

  if (result.evaluation) {
    sections.push({
      title: "Quality verification",
      lines: [
        `Quality score: ${result.evaluation.score}/100`,
        result.evaluation.summary,
        ...result.evaluation.neural_issues.map((issue) => `Neural issue: ${issue}`),
        ...result.evaluation.insights_issues.map((issue) => `Insight issue: ${issue}`)
      ]
    });
  }

  return {
    title,
    category,
    runId: result.runId,
    generatedAt: result.completedAt,
    grade: result.neural.overall.neural_grade,
    sections,
    footer: "Generated by NeuroDraft · TRIBE v2-calibrated prediction report"
  };
}

function buildReportFromAnalysis(snapshot: AnalysisPdfSnapshot): PdfReport {
  const title = snapshot.title?.trim() || "Live analysis snapshot";
  const category = snapshot.category?.trim() || "General";
  const sections: PdfSection[] = [];

  if (snapshot.script?.trim()) {
    sections.push({
      title: "Source script",
      lines: wrapText(snapshot.script, 90)
    });
  }

  if (snapshot.prediction) {
    sections.push({
      title: "Neural summary",
      lines: [
        `Neural grade: ${snapshot.prediction.overall.neural_grade}`,
        `Mean engagement: ${formatPercent(snapshot.prediction.overall.mean_engagement)}`,
        `Memory strength: ${formatPercent(snapshot.prediction.overall.memory_strength)}`,
        `Attention retention: ${formatPercent(snapshot.prediction.overall.attention_retention)}`,
        `Benchmark percentile: ${snapshot.prediction.overall.benchmark_percentile}th`
      ]
    });
  }

  if (snapshot.insights) {
    sections.push({
      title: "Creative notes",
      lines: snapshot.insights.insights.flatMap((insight) => [
        insight.title,
        insight.finding,
        `Recommendation: ${insight.recommendation}`
      ])
    });
  }

  return {
    title,
    category,
    runId: snapshot.runId,
    generatedAt: snapshot.generatedAt ?? new Date().toISOString(),
    grade: snapshot.prediction?.overall.neural_grade,
    sections,
    footer: "Generated from the current NeuroDraft workspace"
  };
}

type DrawCommand =
  | { kind: "text"; x: number; y: number; size: number; color: [number, number, number]; text: string; font?: "regular" | "bold" }
  | { kind: "rect"; x: number; y: number; width: number; height: number; fill: [number, number, number] };

function renderCommands(commands: DrawCommand[]): string {
  const chunks: string[] = [];

  for (const command of commands) {
    if (command.kind === "rect") {
      const [r, g, b] = command.fill.map((value) => (value / 255).toFixed(3));
      chunks.push(`${r} ${g} ${b} rg`);
      chunks.push(`${command.x} ${command.y} ${command.width} ${command.height} re f`);
      continue;
    }

    const [r, g, b] = command.color.map((value) => (value / 255).toFixed(3));
    const fontName = command.font === "bold" ? "/F2" : "/F1";
    chunks.push("BT");
    chunks.push(`${fontName} ${command.size} Tf`);
    chunks.push(`${r} ${g} ${b} rg`);
    chunks.push(`1 0 0 1 ${command.x} ${command.y} Tm`);
    chunks.push(`(${escapePdfText(command.text)}) Tj`);
    chunks.push("ET");
  }

  return chunks.join("\n");
}

function buildPdfBlob(report: PdfReport): Blob {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 48;
  const lineHeight = 14;
  const commandsByPage: DrawCommand[][] = [];
  let commands: DrawCommand[] = [];
  let cursorY = pageHeight - margin;

  const ensureSpace = (height: number): void => {
    if (cursorY - height < margin) {
      commandsByPage.push(commands);
      commands = [];
      cursorY = pageHeight - margin;
    }
  };

  const addBackground = (): void => {
    commands.push({ kind: "rect", x: 0, y: 0, width: pageWidth, height: pageHeight, fill: [10, 10, 10] });
  };

  const addTextBlock = (
    text: string,
    options: { size: number; color: [number, number, number]; font?: "regular" | "bold"; maxWidthChars?: number; gapAfter?: number }
  ): void => {
    const wrapped = wrapText(text, options.maxWidthChars ?? 88);
    ensureSpace(wrapped.length * (options.size + 4) + (options.gapAfter ?? 0));
    wrapped.forEach((line) => {
      commands.push({
        kind: "text",
        x: margin,
        y: cursorY,
        size: options.size,
        color: options.color,
        text: line,
        font: options.font
      });
      cursorY -= options.size + 4;
    });
    cursorY -= options.gapAfter ?? 0;
  };

  addBackground();
  commands.push({ kind: "rect", x: margin, y: pageHeight - 76, width: pageWidth - margin * 2, height: 1, fill: [0, 255, 136] });
  commands.push({ kind: "rect", x: margin, y: pageHeight - 110, width: 6, height: 42, fill: [0, 255, 136] });
  addTextBlock("NeuroDraft", { size: 24, color: [248, 250, 252], font: "bold", gapAfter: 2 });
  addTextBlock("Neural analysis report", { size: 11, color: [148, 163, 184], maxWidthChars: 50, gapAfter: 10 });
  addTextBlock(report.title, { size: 18, color: [248, 250, 252], font: "bold", gapAfter: 4 });
  addTextBlock(`${report.category} · Grade ${report.grade ?? "—"} · ${formatDate(report.generatedAt)}`, {
    size: 10,
    color: [148, 163, 184],
    gapAfter: 12
  });

  const cards = [
    { label: "Neural grade", value: report.grade ?? "—" },
    {
      label: "Scenes",
      value: (() => {
        const sceneSection = report.sections.find((section) => section.title === "Scene-by-scene readout");
        const count = sceneSection ? sceneSection.lines.filter((line) => line.startsWith("Scene ")).length : 0;
        return `${count}`;
      })()
    },
    {
      label: "Insights",
      value: (() => {
        const insightSection = report.sections.find((section) => section.title === "Creative direction");
        const count = insightSection ? insightSection.lines.filter((line) => !line.startsWith("Finding:") && !line.startsWith("Recommendation:")).length : 0;
        return `${count}`;
      })()
    }
  ];

  const cardY = cursorY - 8;
  const cardWidth = (pageWidth - margin * 2 - 16) / 3;
  cards.forEach((card, index) => {
    const x = margin + index * (cardWidth + 8);
    commands.push({ kind: "rect", x, y: cardY - 54, width: cardWidth, height: 48, fill: [17, 17, 17] });
    commands.push({ kind: "text", x: x + 10, y: cardY - 18, size: 9, color: [85, 85, 85], text: card.label.toUpperCase(), font: "bold" });
    commands.push({ kind: "text", x: x + 10, y: cardY - 40, size: 18, color: [0, 255, 136], text: card.value, font: "bold" });
  });
  cursorY = cardY - 72;

  for (const section of report.sections) {
    addTextBlock(section.title, { size: 13, color: [248, 250, 252], font: "bold", gapAfter: 4 });
    section.lines.forEach((line) => {
      if (line.trim().length === 0) {
        cursorY -= 6;
        return;
      }
      addTextBlock(line, { size: 10, color: [170, 170, 170], maxWidthChars: 92, gapAfter: 2 });
    });
    cursorY -= 8;
  }

  ensureSpace(32);
  commands.push({ kind: "rect", x: 0, y: 0, width: pageWidth, height: 24, fill: [17, 17, 17] });
  commands.push({
    kind: "text",
    x: margin,
    y: 10,
    size: 8,
    color: [85, 85, 85],
    text: report.footer ?? "Generated by NeuroDraft",
    font: "regular"
  });

  commandsByPage.push(commands);

  const objects = new Map<number, string>();
  objects.set(1, "<< /Type /Catalog /Pages 2 0 R >>");
  const pageObjectNumbers: number[] = [];
  const fontRegularObject = 3;
  const fontBoldObject = 4;
  objects.set(fontRegularObject, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.set(fontBoldObject, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  commandsByPage.forEach((pageCommands, pageIndex) => {
    const contentObjectNumber = 5 + pageIndex * 2;
    const pageObjectNumber = 6 + pageIndex * 2;
    pageObjectNumbers.push(pageObjectNumber);
    const content = renderCommands(pageCommands);
    objects.set(contentObjectNumber, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    objects.set(
      pageObjectNumber,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegularObject} 0 R /F2 ${fontBoldObject} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`
    );
  });

  objects.set(2, `<< /Type /Pages /Kids [${pageObjectNumbers.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>`);

  const maxObjectNumber = Math.max(...objects.keys());
  let pdf = "%PDF-1.4\n";
  const offsets = new Map<number, number>();

  for (let objectNumber = 1; objectNumber <= maxObjectNumber; objectNumber += 1) {
    const body = objects.get(objectNumber);
    if (!body) {
      continue;
    }
    offsets.set(objectNumber, pdf.length);
    pdf += `${objectNumber} 0 obj\n${body}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${maxObjectNumber + 1}\n0000000000 65535 f \n`;

  for (let objectNumber = 1; objectNumber <= maxObjectNumber; objectNumber += 1) {
    const offset = offsets.get(objectNumber) ?? 0;
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${maxObjectNumber + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

export function createResultPdfReport(result: PipelineResult): PdfReport {
  return buildReportFromResult(result);
}

export function createAnalysisPdfReport(snapshot: AnalysisPdfSnapshot): PdfReport {
  return buildReportFromAnalysis(snapshot);
}

export function getPdfFileName(title: string | null | undefined, grade: string | null | undefined): string {
  const base = toSlug(title ?? "analysis");
  const normalizedGrade = asciiSafe(grade ?? "").replace(/[^A-Za-z0-9]+/g, "").toUpperCase() || "NA";
  return `${base}_advertisement_${normalizedGrade}.pdf`;
}

export async function downloadPdf(report: PdfReport, filename?: string): Promise<void> {
  const blob = buildPdfBlob(report);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename?.trim() || getPdfFileName(report.title, report.grade);
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
