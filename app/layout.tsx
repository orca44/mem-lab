import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Manrope } from "next/font/google";
import "./globals.css";
import "./visuals.css";
import "./evidence.css";
import "./labs.css";
import "./motion.css";
import "./theme.css";

// One family per role: Manrope for headings and figures, DM Sans for text, DM Mono for labels and code.
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Manrope({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Memory Lab — Understand how AI remembers",
  description: "An interactive playground for working, short-term, semantic, episodic, and procedural AI memory.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}><body>{children}</body></html>;
}
