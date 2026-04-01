"use client";

import { useEffect, useState } from "react";

import { Moon, SunMedium } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

const STORAGE_KEY = "neurodraft-theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle(props: { className?: string }): JSX.Element {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const resolvedTheme = stored === "dark" || stored === "light" ? stored : getSystemTheme();

    setTheme(resolvedTheme);
    applyTheme(resolvedTheme);
    setMounted(true);
  }, []);

  function handleToggle(): void {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleToggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className={cn("shrink-0 rounded-full border-[var(--border)] bg-[var(--bg-surface)]", props.className)}
    >
      {mounted && theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export default ThemeToggle;
