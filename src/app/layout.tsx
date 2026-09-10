import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import PersonaToggle from "@/components/PersonaToggle";
import MusicPlayer from "@/components/MusicPlayer";
import TransitionProvider from "@/components/TransitionProvider";
import PageTransitionClient from "@/components/PageTransitionClient";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Nessy — Portfolio",
  description: "Fullstack developer, hobbyist, and maker of small delightful things.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full">
        {/* Route-transition wipe + wipe-aware links */}
        <TransitionProvider>
          <Navbar />
          <main className="min-h-screen pb-40">
            {/* Page entrance: fade + slide with blur for smooth transitions */}
            <PageTransitionClient>{children}</PageTransitionClient>
          </main>
          <PersonaToggle />
          <MusicPlayer />
        </TransitionProvider>
      </body>
    </html>
  );
}
