import { after, NextRequest, NextResponse } from "next/server";
import { computeCapacityCost } from "@/lib/calculator";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail, SITE_URL, TEAM_INBOX } from "@/lib/email/send";
import { linkEnquiry, logEmailSent } from "@/lib/admin/client-link";
import { calculatorReport, teamLeadAlert } from "@/lib/email/templates";

const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const lead = {
      timestamp,
      email,
      staff: staffNum,
      wage: wageNum,
      hours: hoursNum,
      annualWaste,
    };

    // ── Save for the admin Command Center ──────────────────────
    const { data: row, error: dbError } = await supabaseAdmin
      .from("calculator_leads")
      .insert({
        email: lead.email,
        staff: lead.staff,
        wage: lead.wage,
        hours: lead.hours,
        annual_waste: lead.annualWaste,
      })
      .select("id")
      .single();
    if (dbError) {
      console.error("[calculator-leads] insert error:", dbError.message);
    }

    // ── Emails: the breakdown to the visitor, an alert to us ──
    const myr = (n: number) => `RM${Math.round(n).toLocaleString("en-MY")}`;
    after(async () => {
      const clientId = row
        ? await linkEnquiry({
            source: "calculator",
            leadId: row.id,
            name: "",
            email: lead.email,
            headline: `${lead.staff} staff, ${lead.hours} admin hrs/wk, ${myr(lead.annualWaste)}/yr lost`,
          })
        : null;
      const report = calculatorReport({ ...lead, siteUrl: SITE_URL });
      const [sent] = await Promise.all([
        sendEmail(lead.email, report),
        sendEmail(
          TEAM_INBOX,
          teamLeadAlert({
            source: "Calculator",
            name: lead.email,
            email: lead.email,
            rows: [
              { label: "Annual waste", value: myr(lead.annualWaste) },
              { label: "Admin staff", value: String(lead.staff) },
              { label: "Monthly wage", value: myr(lead.wage) },
              { label: "Admin hrs / week", value: `${lead.hours} hrs` },
            ],
            adminUrl: clientId
              ? `${SITE_URL}/admin/clients/${clientId}`
              : `${SITE_URL}/admin/command?source=calculator`,
            accent: "#00F0FF",
          }),
          lead.email,
        ),
      ]);
      if (clientId && sent.ok) await logEmailSent(clientId, report.subject, lead.email, sent.id);
    });

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
