import { supabaseAdmin } from "@/lib/supabase/server";
import { verifyAdmin } from "@/lib/auth/verify";
import { NextRequest, NextResponse } from "next/server";

const BUCKETS = [
  "avatars",
  "legal-docs",
  "portfolio-images",
  "blog-images",
];

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results: Record<string, string> = {};

  for (const bucket of BUCKETS) {
    const { error } = await supabaseAdmin.storage.createBucket(bucket, {
      public: true,
      allowedMimeTypes: ["image/*", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
    });

    if (error) {
      if (error.message?.includes("already exists")) {
        results[bucket] = "already exists";
      } else {
        results[bucket] = `error: ${error.message}`;
      }
    } else {
      results[bucket] = "created";
    }
  }

  return NextResponse.json({ success: true, buckets: results });
}
