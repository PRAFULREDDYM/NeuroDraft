"use client";

import type { JSX } from "react";

import { motion } from "framer-motion";
import { ArrowUp, Download } from "lucide-react";

import { Button } from "@/components/ui/button";

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
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed bottom-5 right-5 z-40 flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-sm"
      aria-label="Floating actions"
    >
      {showDownload ? (
        <Button
          type="button"
          size="sm"
          className="justify-start gap-2"
          onClick={() => {
            void props.onDownloadPdf?.();
          }}
          disabled={props.downloadDisabled ?? false}
          aria-label="Download PDF report"
        >
          <Download className="h-4 w-4" />
          {props.isDownloadingPdf ? "Preparing PDF..." : "Download PDF"}
        </Button>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="justify-start gap-2"
        onClick={handleScrollTop}
        aria-label="Scroll back to top"
      >
        <ArrowUp className="h-4 w-4" />
        Top
      </Button>
    </motion.div>
  );
}
