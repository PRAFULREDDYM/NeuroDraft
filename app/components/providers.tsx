"use client";

import type { ReactNode } from "react";

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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{props.children}</TooltipProvider>
    </QueryClientProvider>
  );
}
