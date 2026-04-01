"use client";

import { useEffect } from "react";

export function MouseGlow(): React.JSX.Element {
  useEffect(() => {
    const updatePosition = (event: MouseEvent): void => {
      document.body.style.setProperty("--mx", `${event.clientX}px`);
      document.body.style.setProperty("--my", `${event.clientY}px`);
    };

    document.body.style.setProperty("--mx", "50vw");
    document.body.style.setProperty("--my", "30vh");
    window.addEventListener("mousemove", updatePosition);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
    };
  }, []);

  return <></>;
}
