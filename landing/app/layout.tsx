import type { Metadata } from "next";

import "./globals.css";
import { MouseGlow } from "@/components/MouseGlow";

export const metadata: Metadata = {
  title: "NeuroDraft",
  description: "Predict neural engagement before you spend a dollar."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body className="bg-base text-primary antialiased">
        <MouseGlow />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
