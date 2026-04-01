"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle(): React.JSX.Element | null {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="relative flex h-9 w-16 items-center rounded-full border border-[var(--border)] bg-[var(--surface-sunken)] px-1 transition-colors hover:border-[var(--accent-primary)]"
      aria-label="Toggle Theme"
    >
      <motion.div
        className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface)] shadow-md"
        animate={{ x: theme === "dark" ? 0 : 28 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {theme === "dark" ? (
          <Moon className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
        )}
      </motion.div>
    </button>
  );
}
