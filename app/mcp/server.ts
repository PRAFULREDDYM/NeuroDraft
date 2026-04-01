#!/usr/bin/env node
/**
 * NeuroDraft MCP Server
 * Exposes neural ad analysis as tools for Claude Desktop / Cursor / any MCP client.
 *
 * Usage: node mcp/server.js
 * Config: add to claude_desktop_config.json (see README)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = process.env.NEURODRAFT_URL ?? "http://localhost:3000";

const server = new Server(
  { name: "neurodraft", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "analyze_ad_script",
      description: "Analyze an ad script using TRIBE v2-calibrated neural prediction. Returns engagement scores, neural grade, scene-by-scene heatmap, and creative insights. Takes 25-45 seconds.",
      inputSchema: {
        type: "object",
        properties: {
          script: {
            type: "string",
            description: "The ad script to analyze. Include scene descriptions, voiceover lines, and any emotional direction. Minimum 15 words."
          }
        },
        required: ["script"]
      }
    },
    {
      name: "get_analysis_result",
      description: "Retrieve the result of a previously started analysis by its run ID.",
      inputSchema: {
        type: "object",
        properties: {
          runId: {
            type: "string",
            description: "The run ID returned by analyze_ad_script."
          }
        },
        required: ["runId"]
      }
    },
    {
      name: "compare_scripts",
      description: "Analyze two ad scripts and compare their neural scores. Returns which performs better and why.",
      inputSchema: {
        type: "object",
        properties: {
          script_a: { type: "string", description: "First ad script to compare." },
          script_b: { type: "string", description: "Second ad script to compare." },
          label_a: { type: "string", description: "Label for script A (e.g. Version 1).", default: "Script A" },
          label_b: { type: "string", description: "Label for script B (e.g. Version 2).", default: "Script B" }
        },
        required: ["script_a", "script_b"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "analyze_ad_script") {
      const { script } = args as { script: string };

      if (!script || script.trim().split(/\s+/).length < 10) {
        return { content: [{ type: "text", text: "Error: Script too short. Please provide at least 15 words." }], isError: true };
      }

      const startRes = await fetch(`${BASE_URL}/api/pipeline/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script })
      });

      if (!startRes.ok) {
        return { content: [{ type: "text", text: `Error starting pipeline: ${startRes.status}` }], isError: true };
      }

      const startJson = await startRes.json() as { runId: string };
      const runId = startJson.runId;

      let attempts = 0;
      while (attempts < 45) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts += 1;

        const resultRes = await fetch(`${BASE_URL}/api/results/${runId}`);
        if (resultRes.ok) {
          const payload = await resultRes.json();
          const result = payload.result ?? payload;
          if (result?.neural && result?.insights) {
            return { content: [{ type: "text", text: formatResultForMCP(result, runId) }] };
          }
        }
      }

      return { content: [{ type: "text", text: `Analysis timed out. Use get_analysis_result with runId: ${runId}` }] };
    }

    if (name === "get_analysis_result") {
      const { runId } = args as { runId: string };
      const res = await fetch(`${BASE_URL}/api/results/${runId}`);
      if (!res.ok) {
        return { content: [{ type: "text", text: `No result found for runId: ${runId}` }], isError: true };
      }
      const payload = await res.json();
      const result = payload.result ?? payload;
      return { content: [{ type: "text", text: formatResultForMCP(result, runId) }] };
    }

    if (name === "compare_scripts") {
      const { script_a, script_b, label_a = "Script A", label_b = "Script B" } = args as {
        script_a: string;
        script_b: string;
        label_a?: string;
        label_b?: string;
      };

      const [resA, resB] = await Promise.all([
        fetch(`${BASE_URL}/api/pipeline/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ script: script_a })
        }).then(async (res) => res.json() as Promise<{ runId: string }>),
        fetch(`${BASE_URL}/api/pipeline/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ script: script_b })
        }).then(async (res) => res.json() as Promise<{ runId: string }>)
      ]);

      await new Promise((resolve) => setTimeout(resolve, 40000));

      const [resultAResponse, resultBResponse] = await Promise.all([
        fetch(`${BASE_URL}/api/results/${resA.runId}`).then(async (res) => (res.ok ? res.json() : null)),
        fetch(`${BASE_URL}/api/results/${resB.runId}`).then(async (res) => (res.ok ? res.json() : null))
      ]);

      const resultA = resultAResponse?.result ?? resultAResponse;
      const resultB = resultBResponse?.result ?? resultBResponse;

      if (!resultA || !resultB) {
        return { content: [{ type: "text", text: `Comparison timed out. RunIDs: A=${resA.runId} B=${resB.runId}` }] };
      }

      const scoreA = resultA.neural?.overall?.mean_engagement ?? 0;
      const scoreB = resultB.neural?.overall?.mean_engagement ?? 0;
      const winner = scoreA >= scoreB ? label_a : label_b;
      const diff = Math.abs(Math.round((scoreA - scoreB) * 100));

      const text = [
        `## Script Comparison: ${label_a} vs ${label_b}`,
        "",
        `**Winner: ${winner}** (${diff}% higher mean engagement)`,
        "",
        `### ${label_a}`,
        `- Neural grade: ${resultA.neural?.overall?.neural_grade}`,
        `- Mean engagement: ${Math.round(scoreA * 100)}%`,
        `- Memory strength: ${Math.round((resultA.neural?.overall?.memory_strength ?? 0) * 100)}%`,
        `- Benchmark: ${resultA.neural?.overall?.benchmark_percentile}th percentile`,
        "",
        `### ${label_b}`,
        `- Neural grade: ${resultB.neural?.overall?.neural_grade}`,
        `- Mean engagement: ${Math.round(scoreB * 100)}%`,
        `- Memory strength: ${Math.round((resultB.neural?.overall?.memory_strength ?? 0) * 100)}%`,
        `- Benchmark: ${resultB.neural?.overall?.benchmark_percentile}th percentile`,
        "",
        `### Why ${winner} wins`,
        scoreA >= scoreB ? (resultA.insights?.overall_verdict ?? "") : (resultB.insights?.overall_verdict ?? ""),
        "",
        "View full results:",
        `- ${label_a}: ${BASE_URL}/results/${resA.runId}`,
        `- ${label_b}: ${BASE_URL}/results/${resB.runId}`
      ].join("\n");

      return { content: [{ type: "text", text }] };
    }

    return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
  }
});

function formatResultForMCP(result: any, runId: string): string {
  const n = result.neural?.overall ?? {};
  const segments = result.neural?.segments ?? [];
  const insights = result.insights?.insights ?? [];

  const lines = [
    `## NeuroDraft Analysis: ${result.title ?? "Ad Script"}`,
    "",
    `**Neural grade: ${n.neural_grade ?? "—"}** · ${n.benchmark_percentile ?? 0}th percentile`,
    `Mean engagement: ${Math.round((n.mean_engagement ?? 0) * 100)}% · Memory strength: ${Math.round((n.memory_strength ?? 0) * 100)}%`,
    `Engagement arc: ${n.engagement_arc ?? "—"} · Emotional valence: ${n.emotional_valence ?? "—"}`,
    "",
    "### Overall verdict",
    result.insights?.overall_verdict ?? "—",
    "",
    "### Scene-by-scene scores",
    ...segments.map((s: any) => {
      const sc = s.neural_scores ?? {};
      return [
        `**Scene ${s.scene_id}** (${s.time_start}–${s.time_end}s)`,
        `Visual ${Math.round((sc.visual_cortex_engagement ?? 0) * 100)}% · Attention ${Math.round((sc.prefrontal_attention ?? 0) * 100)}% · Emotion ${Math.round((sc.amygdala_emotional_arousal ?? 0) * 100)}% · Memory ${Math.round((sc.hippocampal_memory_encoding ?? 0) * 100)}%`,
        `↑ ${s.peak_moment ?? ""} | ↓ ${s.drop_moment ?? ""}`,
        ""
      ].join("\n");
    }),
    "### Creative insights",
    ...insights.map((ins: any) => `**[${String(ins.impact ?? "").toUpperCase()}] ${ins.title}**\n${ins.finding}\n→ ${ins.recommendation}\n`)
  ];

  if (result.insights?.rewrite_suggestion) {
    const rw = result.insights.rewrite_suggestion;
    lines.push("### Rewrite suggestion");
    lines.push(`Original: "${rw.original_line}"`);
    lines.push(`Improved: "${rw.rewritten_line}"`);
    lines.push(`Why: ${rw.reason}`);
    lines.push("");
  }

  if (result.insights?.headline_test?.length) {
    lines.push("### Headline recall test");
    [...result.insights.headline_test]
      .sort((a: any, b: any) => b.predicted_recall_score - a.predicted_recall_score)
      .forEach((h: any) => lines.push(`${h.predicted_recall_score} — ${h.headline}`));
    lines.push("");
  }

  if (result.evaluation?.score !== undefined) {
    lines.push(`Quality verification: ${result.evaluation.score}/100`);
  }

  lines.push(`\nView full results: ${BASE_URL}/results/${runId}`);
  return lines.join("\n");
}

const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  process.stderr.write("NeuroDraft MCP server running\n");
});
