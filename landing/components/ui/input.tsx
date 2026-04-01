import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "form-input w-full rounded-full px-4 py-3 text-sm text-primary outline-none transition-colors placeholder:text-muted",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
