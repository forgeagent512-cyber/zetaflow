import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BUILDAGENT - AI Workforce Operating System",
  description:
    "Enterprise-grade AI Workforce Operating System for building, deploying, and managing intelligent autonomous agents at scale.",
  keywords: [
    "AI",
    "workforce",
    "automation",
    "agents",
    "enterprise",
    "BUILDAGENT",
  ],
  authors: [{ name: "BUILDAGENT" }],
  creator: "BUILDAGENT",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BUILDAGENT",
    title: "BUILDAGENT - AI Workforce Operating System",
    description:
      "Enterprise-grade AI Workforce Operating System for building, deploying, and managing intelligent autonomous agents at scale.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BUILDAGENT - AI Workforce Operating System",
    description:
      "Enterprise-grade AI Workforce Operating System for building, deploying, and managing intelligent autonomous agents at scale.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          jetbrainsMono.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}