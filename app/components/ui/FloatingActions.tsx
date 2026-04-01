"use client";

import type { JSX } from "react";

import { motion } from "framer-motion";
import { ArrowUp, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FloatingActionsProps {
  onDownloadPdf?: () => Promise<void> | void;
  isDownloadingPdf?: boolean;
  downloadDisabled?: boolean;
}

export function FloatingActions(props: FloatingActionsProps): JSX.Element {
  const handleScrollTop = (): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showDownload = typeof props.onDownloadPdf === "function";

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed bottom-6 right-6 z-40 flex flex-col gap-3"
        aria-label="Floating actions"
      >
        {showDownload ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="default"
                className="h-10 w-10 shrink-0 rounded-full bg-[var(--accent-primary)] text-black shadow-lg hover:scale-105 active:scale-95 transition-transform"
                onClick={() => {
                  void props.onDownloadPdf?.();
                }}
                disabled={props.downloadDisabled ?? false}
              >
                <Download className="h-4.5 w-4.5" />
                <span className="sr-only">Download PDF Report</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border)]">
              {props.isDownloadingPdf ? "Preparing PDF..." : "Download PDF Report"}
            </TooltipContent>
          </Tooltip>
        ) : null}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] shadow-lg hover:scale-105 active:scale-95 transition-transform"
              onClick={handleScrollTop}
            >
              <ArrowUp className="h-4.5 w-4.5" />
              <span className="sr-only">Scroll to top</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border)]">
            Back to top
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
}
