import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ChatbotWidget } from "@/components/ui/ChatbotWidget";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

const instrumentSerifDisplay = Instrument_Serif({
  variable: "--font-instrument-serif-display",
  subsets: ["latin"],
  weight: "400",
  style: "normal",
});

import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://aurexissolution.com",
  ),
  title: "AUREXIS SOLUTION | AI, Web & App Automation",
  description: "Building high-performance AI, Web, and App ecosystems for the next generation of industry leaders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${plusJakartaSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${instrumentSerifDisplay.variable}`}
    >
      <body className="antialiased font-sans flex flex-col min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-black"
        >
          Skip to content
        </a>
        <SmoothScrollProvider>
          <div id="main">{children}</div>
        </SmoothScrollProvider>
        <ChatbotWidget />
      </body>
    </html>
  );
}
