"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export function SmoothScroll({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (time: number) => Math.min(1, 1.001 - 2 ** (-10 * time)),
      smoothWheel: true
    });

    let frameId = 0;

    const raf = (time: number): void => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(raf);
    };

    frameId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
