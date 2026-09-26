import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ChatbotWidget } from "@/components/ui/ChatbotWidget";
import { LeadPopup } from "@/components/ui/LeadPopup";

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

import { SITE_URL, organizationJsonLd } from "@/lib/seo";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Aurexis Solution | Websites, Automation & AI in Malaysia",
  description:
    "Aurexis Solution builds websites, admin automation, custom systems, WhatsApp lead tools and AI for Malaysian SMEs. Fixed prices from RM1,525. Kuala Lumpur.",
  applicationName: "Aurexis Solution",
  keywords: [
    "Aurexis Solution",
    "Aurexis",
    "website design Malaysia",
    "business automation Malaysia",
    "AI automation Malaysia",
    "WhatsApp Business API Malaysia",
    "LHDN e-Invoice",
    "custom business software Malaysia",
  ],
  alternates: { canonical: "./" },
  openGraph: {
    siteName: "Aurexis Solution",
    type: "website",
    locale: "en_MY",
  },
  twitter: { card: "summary_large_image" },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
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
        <LeadPopup />
      </body>
    </html>
  );
}
