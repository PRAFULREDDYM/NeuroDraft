"use client";

import { motion } from "framer-motion";

export function HeroAppMockup() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
      className="relative mx-auto mt-16 w-full max-w-[1100px] rounded-[16px] border border-[var(--border)] bg-[var(--surface-sunken)] p-1.5 shadow-2xl xl:shadow-[0_0_80px_rgba(14,165,233,0.15)] ring-1 ring-[var(--border-strong)] z-20 text-left"
    >
      {/* Top Browser Bar */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-deep)] px-4 py-3 rounded-t-[12px]">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-slate-500/30" />
          <div className="h-3 w-3 rounded-full bg-slate-500/30" />
          <div className="h-3 w-3 rounded-full bg-slate-500/30" />
        </div>
        <div className="mx-auto flex h-7 w-[240px] items-center justify-center rounded-md bg-[var(--surface)] border border-[var(--border-strong)] text-[11px] font-medium text-[var(--text-faint)] shadow-inner">
          app.neurodraft.com
        </div>
        <div className="w-[42px] hidden md:block" />
      </div>
      
      {/* App Content */}
      <div className="grid h-[500px] grid-cols-1 md:grid-cols-[1fr_340px] bg-[var(--page-bg)] rounded-b-[12px] overflow-hidden">
        {/* Script Editor Panel */}
        <div className="flex flex-col border-r border-[var(--border)] p-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">Campaign_Script_v2.docx</h3>
            <span className="rounded-full bg-[var(--accent-muted)] px-3 py-1 text-[11px] font-medium text-[var(--accent-primary)] flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-primary)]"></span>
              </span>
              Analyzing Sequence
            </span>
          </div>
          
          <div className="space-y-5 font-mono text-[13px] leading-[1.8] text-[var(--text-soft)]">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
              [SCENE 01 - 0:00]
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}>
              INT. WAREHOUSE - NIGHT
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}>
              <span className="text-[var(--text-primary)] font-medium">NARRATOR:</span> For the ones who never clock out.
            </motion.p>
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: "100%" }}
               transition={{ delay: 2, duration: 2, ease: "linear" }}
               className="h-[2px] bg-[var(--accent-muted)] mt-1 relative overflow-hidden rounded-full"
            >
               <motion.div 
                 initial={{ x: "-100%" }}
                 animate={{ x: "100%" }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                 className="absolute inset-y-0 left-0 w-1/3 bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]"
               />
            </motion.div>
            <motion.p initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ delay: 3, duration: 1 }} className="mt-8">
              (A single industrial floodlight clicks on, illuminating a muddy boot stomping into frame)
            </motion.p>
            <motion.p initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ delay: 3.5, duration: 1 }}>
              <span className="text-[var(--text-primary)] font-medium">SFX:</span> Heavy bass drop synced with the stomp.
            </motion.p>
          </div>
        </div>

        {/* Brain Metrics Sidebar */}
        <div className="flex flex-col bg-[var(--surface-alt)] p-6 z-10">
           <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-8 mt-2">Neural Telemetry</h3>
           
           <div className="space-y-6 flex-1">
              {[
                { label: "Visual Engagement", score: 94, val: "A+" },
                { label: "Predictive Arousal", score: 88, val: "A" },
                { label: "Semantic Encoding", score: 72, val: "B-" },
                { label: "Attention Drop", score: 45, val: "Crit" }
              ].map((metric, i) => (
                <div key={metric.label} className="space-y-2.5">
                  <div className="flex justify-between font-mono text-[11px] uppercase tracking-wide">
                    <span className="text-[var(--text-soft)]">{metric.label}</span>
                    <span className={metric.val === "Crit" ? "text-red-500 font-bold" : "text-[var(--accent-primary)]"}>{metric.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--border-strong)] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${metric.score}%` }} 
                      transition={{ delay: 4 + (i * 0.4), duration: 1.5, type: "spring", bounce: 0.2 }}
                      className={`h-full ${metric.val === "Crit" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-[var(--accent-primary)] shadow-[0_0_8px_rgba(14,165,233,0.4)]"}`}
                    />
                  </div>
                </div>
              ))}
           </div>
           
           <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 6.5 }}
              className="mt-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 backdrop-blur-md"
           >
              <div className="pt-0.5">
                 <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mt-1" />
              </div>
              <div>
                <p className="text-[12px] text-red-500 font-semibold mb-1">Pacing Warning</p>
                <p className="text-[11px] text-red-500/80 leading-[1.6]">The 2-second silence before the bass drop reduces working memory encoding by 24%. Tighten the cut.</p>
              </div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
