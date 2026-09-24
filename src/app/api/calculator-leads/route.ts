import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { computeCapacityCost } from "@/lib/calculator";

const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const LEAD_NOTIFICATION_EMAIL =
  process.env.LEAD_NOTIFICATION_EMAIL || "contact@aurexissolution.com";
const LEAD_FROM_EMAIL =
  process.env.LEAD_FROM_EMAIL || "Aurexis Leads <onboarding@resend.dev>";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const myrFormatter = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface Lead {
  timestamp: string;
  email: string;
  staff: number;
  wage: number;
  hours: number;
  annualWaste: number;
}

function buildLeadEmail(lead: Lead): { subject: string; html: string; text: string } {
  const wasteFormatted = myrFormatter.format(lead.annualWaste);
  const monthly = myrFormatter.format(Math.round(lead.annualWaste / 12));
  const wageFormatted = myrFormatter.format(lead.wage);
  const localDate = new Date(lead.timestamp).toLocaleString("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const subject = `New calculator lead · ${lead.email} · ${wasteFormatted}/yr`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#02040A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f5f5f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#02040A;padding:24px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#0A0B12;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;">
        <tr><td style="padding:24px 28px 18px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(0,240,255,0.85);">
            Aurexis · Calculator Lead
          </div>
          <h1 style="font-family:Georgia,serif;font-style:italic;font-size:26px;font-weight:400;color:#fff;margin:8px 0 0;letter-spacing:-0.02em;">
            New inquiry from <span style="color:#00F0FF;">${escape(lead.email)}</span>
          </h1>
        </td></tr>

        <tr><td style="padding:24px 28px;">
          <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:6px;">
            Estimated annual waste
          </div>
          <div style="font-family:Georgia,serif;font-style:italic;font-size:48px;line-height:1;color:#fff;letter-spacing:-0.02em;">
            ${wasteFormatted}
          </div>
          <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;color:rgba(255,255,255,0.55);margin-top:8px;">
            ≈ ${monthly} / month
          </div>
        </td></tr>

        <tr><td style="padding:0 28px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:18px;">
            <tr>
              <td style="padding:10px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.40);">Admin Staff</td>
              <td align="right" style="padding:10px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;color:#fff;">${lead.staff} ${lead.staff === 1 ? "person" : "people"}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.04);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.40);">Monthly wage / person</td>
              <td align="right" style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.04);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;color:#fff;">${wageFormatted}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.04);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.40);">Admin hrs / person / week</td>
              <td align="right" style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.04);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;color:#fff;">${lead.hours} hrs</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:18px 28px 24px;border-top:1px solid rgba(255,255,255,0.06);">
          <a href="mailto:${escape(lead.email)}?subject=${encodeURIComponent("Re: your Aurexis automation breakdown")}" style="display:inline-block;background:#00F0FF;color:#02040A;text-decoration:none;font-weight:600;font-size:13px;padding:11px 18px;border-radius:8px;">
            Reply to ${escape(lead.email)} →
          </a>
          <div style="margin-top:14px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.30);">
            Submitted ${escape(localDate)} MYT
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `New Aurexis calculator lead`,
    ``,
    `Email: ${lead.email}`,
    `Estimated annual waste: ${wasteFormatted}`,
    `Estimated monthly waste: ${monthly}`,
    ``,
    `Admin staff: ${lead.staff}`,
    `Monthly wage / person: ${wageFormatted}`,
    `Admin hours per person / week: ${lead.hours}`,
    ``,
    `Submitted ${localDate} MYT`,
  ].join("\n");

  return { subject, html, text };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, staff, wage, hours } = body;

    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
    }

    const staffNum = Number(staff);
    const wageNum = Number(wage);
    const hoursNum = Number(hours);

    if (!Number.isFinite(staffNum) || staffNum < 1) {
      return NextResponse.json({ success: false, error: "Invalid staff count" }, { status: 400 });
    }
    if (!Number.isFinite(wageNum) || wageNum < 0) {
      return NextResponse.json({ success: false, error: "Invalid wage" }, { status: 400 });
    }
    if (!Number.isFinite(hoursNum) || hoursNum < 0 || hoursNum > 168) {
      return NextResponse.json({ success: false, error: "Invalid hours" }, { status: 400 });
    }

    // Same function the page uses, so the emailed figure always equals the screen.
    const { annualCost } = computeCapacityCost(staffNum, wageNum, hoursNum);
    const annualWaste = Math.round(annualCost);
    const timestamp = new Date().toISOString();

    const lead: Lead = {
      timestamp,
      email,
      staff: staffNum,
      wage: wageNum,
      hours: hoursNum,
      annualWaste,
    };

    // ── Primary delivery: email via Resend ─────────────────────
    if (RESEND_API_KEY) {
      try {
        const resend = new Resend(RESEND_API_KEY);
        const { subject, html, text } = buildLeadEmail(lead);
        const { error } = await resend.emails.send({
          from: LEAD_FROM_EMAIL,
          to: LEAD_NOTIFICATION_EMAIL,
          replyTo: lead.email,
          subject,
          html,
          text,
        });
        if (error) {
          console.error("[calculator-leads] Resend error:", error);
        }
      } catch (err) {
        console.error("[calculator-leads] Resend exception:", err);
      }
    } else {
      console.warn(
        "[calculator-leads] RESEND_API_KEY not set — email not sent. Lead:",
        lead,
      );
    }

    // ── Optional secondary: Google Sheets webhook ──────────────
    if (GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        const res = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lead),
          redirect: "follow",
        });
        if (!res.ok) {
          console.error("[calculator-leads] Sheets webhook non-OK:", res.status, await res.text());
        }
      } catch (err) {
        console.error("[calculator-leads] Sheets webhook error:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[calculator-leads] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
