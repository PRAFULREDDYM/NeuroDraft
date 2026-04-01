"use client";

import { useEffect, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5_000,
      retry: 1,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 0
    }
  }
});

export function AppProviders(props: { children: ReactNode }): JSX.Element {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const cleanupStalePwa = async (): Promise<void> => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const hadRegistrations = registrations.length > 0;

        await Promise.all(
          registrations.map(async (registration) => {
            await registration.unregister();
          })
        );

        if ("caches" in window) {
          const cacheKeys = await caches.keys();
          await Promise.all(
            cacheKeys
              .filter((key) => key.includes("workbox") || key.includes("precache") || key.includes("runtime"))
              .map(async (key) => caches.delete(key))
          );
        }

        const alreadyReloaded = sessionStorage.getItem("neurodraft-sw-cleaned") === "1";
        if (hadRegistrations && !alreadyReloaded) {
          sessionStorage.setItem("neurodraft-sw-cleaned", "1");
          window.location.reload();
        }
      } catch (error) {
        console.warn("[NeuroDraft] Service worker cleanup skipped", error);
      }
    };

    void cleanupStalePwa();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{props.children}</TooltipProvider>
    </QueryClientProvider>
  );
}
