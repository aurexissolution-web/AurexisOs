import { supabaseAdmin } from "@/lib/supabase/server";
import { SERVICES } from "@/data/solutions-services";
import { CHANNELS, STUDIOS, STUDIO_HOURS } from "@/data/contact-config";

export const runtime = "nodejs";

// Simple in-memory rate limiter (per IP, 10 requests per minute)
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

const MAX_MESSAGE_LENGTH = 1000;

// Built from the same SERVICES array that renders /solutions, so the chat
// can never quote a price, tier, feature or service name the site doesn't
// actually have.
const SERVICES_LISTING = SERVICES.map((s) => {
  const price = [s.pricePrefix, s.priceAmount, s.priceSuffix].filter(Boolean).join(" ");
  const bullets = (s.bullets ?? []).map((b) => `  · ${b}`).join("\n");
  return `- ${s.name} (${s.category}) — ${price}. ${s.problemLine}\n${bullets}`;
}).join("\n");

// Real contact channels — the same ones rendered on /contact.
const STUDIOS_LISTING = STUDIOS.map((s) => `${s.city}, ${s.country} (${s.role})`).join(" · ");
const CONTACT_DETAILS = `
- WhatsApp: ${CHANNELS.whatsappUrl} (${CHANNELS.phone})
- Email: ${CHANNELS.email}
- Studios: ${STUDIOS_LISTING} — ${STUDIO_HOURS}
`.trim();

const CONTEXT_PREAMBLE = `
You are the Aurexis Architect — the live chat on aurexissolution.com's /solutions page. You're texting with someone checking if Aurexis is worth talking to, not writing a proposal.

Aurexis builds business systems for Malaysian SMEs — websites, admin automation, custom operations platforms, lead systems, and an AI readiness diagnostic.

The five services, with their real starting prices and real included features — these are the ONLY services, prices and features that exist. Never invent a feature, service, tier, or number beyond what's listed here, and never quote a price in any currency other than Malaysian Ringgit (RM):
${SERVICES_LISTING}

Real contact details — these are the ONLY contact channels that exist. Never invent a phone number, email, or office address:
${CONTACT_DETAILS}

How to talk:
- Write like a knowledgeable person texting back, not a brochure. 2-4 short sentences for most questions. No markdown headers, no bold labels, no numbered feature lists — plain sentences, occasionally one short line of dashes for 2-3 items at most.
- Never dump the full discovery-to-launch process unless someone directly asks "how does this work" or "what's the process."
- If you mention what's included, use the exact bullets given above — don't invent extra features like "analytics setup" or "SEO ranking" that aren't listed.
- Prices are starting ("From") prices — the final number depends on scope, and only Aurexis can confirm an exact quote after a real conversation.
- If someone asks about pricing, timelines, or a discount you can't confirm, say so honestly and point them to WhatsApp rather than guessing.
- If someone asks how to contact Aurexis, reach a human, or get in touch — give them the real WhatsApp link and number directly (not just "reach out to us"), plus email if relevant. Always include the WhatsApp link as a clickable URL exactly as given above.
- If a question is about something Aurexis doesn't offer, say so plainly instead of stretching one of the five services to fit.
`;

type GroqResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function POST(req: Request) {
  // Rate limiting by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return Response.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { message?: unknown; session_id?: unknown } | null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const sessionId = typeof body?.session_id === "string" ? body.session_id.trim() : "";

  if (!message) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return Response.json({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` }, { status: 400 });
  }

  if (sessionId && !/^[a-zA-Z0-9_-]{1,64}$/.test(sessionId)) {
    return Response.json({ error: "Invalid session ID" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AI service is not configured" },
      { status: 503 }
    );
  }

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  // Load recent conversation history for context
  let historyMessages: { role: string; content: string }[] = [];
  if (sessionId) {
    const { data: history } = await supabaseAdmin
      .from("chat_logs")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(20);
    if (history) {
      historyMessages = history.map((h) => ({ role: h.role, content: h.content }));
    }
  }

  const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: CONTEXT_PREAMBLE },
        ...historyMessages,
        { role: "user", content: message }
      ],
      temperature: 0.4,
      max_tokens: 220,
      // gpt-oss models spend part of max_tokens on hidden chain-of-thought
      // before the visible answer — "low" keeps that overhead small so a
      // short chat reply doesn't get cut off mid-sentence.
      reasoning_effort: "low",
    }),
  });

  const json = (await upstream.json().catch(() => null)) as GroqResponse | null;

  if (!upstream.ok) {
    const errorMsg = json?.error?.message || `Upstream error (${upstream.status})`;
    const status = upstream.status === 429 ? 429 : 502;
    return Response.json({ error: errorMsg }, { status });
  }

  const answer = json?.choices?.[0]?.message?.content?.trim() ?? "";

  // Persist both messages to chat_logs for learning
  if (sessionId) {
    const rows = [
      { session_id: sessionId, role: "user", content: message },
      { session_id: sessionId, role: "assistant", content: answer },
    ];
    supabaseAdmin.from("chat_logs").insert(rows).then(() => {});
  }

  return Response.json({ answer }, { status: 200 });
}
