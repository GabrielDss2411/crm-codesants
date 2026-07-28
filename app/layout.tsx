import type { Metadata } from "next";
import { Space_Grotesk, Hanken_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/shell";
import { getRepository } from "@/lib/data/repository";

const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const sans = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const mono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "CodeSants CRM",
    template: "%s · CodeSants CRM",
  },
  description:
    "Diagnósticos estratégicos, leads e projetos da CodeSants em um só lugar.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonte = getRepository().kind;

  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}
    >
      <body>
        <Shell fonte={fonte}>{children}</Shell>
      </body>
    </html>
  );
}
