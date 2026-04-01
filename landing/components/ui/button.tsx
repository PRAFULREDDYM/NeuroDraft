import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-transform duration-200",
        variant === "default"
          ? "button-primary glow-outline hover:scale-105"
          : "border border-soft bg-transparent text-primary hover:bg-[var(--text-primary)]/5",
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
