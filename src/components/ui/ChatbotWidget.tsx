"use client";

import { MorphPanel } from "@/components/ui/ai-input";
import { shouldHideChatbot } from "@/components/ui/chatbot-visibility";
import { usePathname } from "next/navigation";

export function ChatbotWidget() {
  const pathname = usePathname();

  if (shouldHideChatbot(pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <MorphPanel />
    </div>
  );
}
