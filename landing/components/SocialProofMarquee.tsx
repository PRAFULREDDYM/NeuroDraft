"use client";

import { motion } from "framer-motion";

const brands = [
  "OGILVY", "W&K", "DROGA5", "MEDIAARTSLAB", "BBDO", "MCCANN", "TBWA", "LEOBURNETT"
];

export function SocialProofMarquee(): React.JSX.Element {
  return (
    <div className="relative mt-24 mb-16 flex w-full flex-col items-center justify-center overflow-hidden border-y border-[var(--border)] bg-[var(--surface-sunken)] py-8">
      <div className="absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--surface-sunken)] to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--surface-sunken)] to-transparent" />

      <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">
        Validated by researchers at top agencies
      </p>

      <div className="flex w-[200%] gap-8">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex w-full justify-around gap-12 whitespace-nowrap"
        >
          {/* We duplicate the array to create a seamless loop */}
          {[...brands, ...brands, ...brands].map((brand, i) => (
            <div
              key={`${brand}-${i}`}
              className="px-4 text-xl font-black italic tracking-tighter text-[var(--border-strong)] transition-colors hover:text-[var(--text-muted)] sm:text-2xl"
            >
              {brand}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
