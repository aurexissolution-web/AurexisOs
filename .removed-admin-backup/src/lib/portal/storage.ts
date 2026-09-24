"use client";

import { supabase } from "@/lib/supabase/client";

export const CUSTOMER_FILES_BUCKET = "customer-files";

export type CustomerFileCategory = "invoices" | "receipts" | "documents";

/**
 * A stored file value is either:
 *   - A storage path inside customer-files bucket: "cust-123/invoices/1701234567-invoice.pdf"
 *   - A full external URL: "https://drive.google.com/..."
 *
 * We discriminate by the http(s) prefix.
 */
export function isExternalUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.startsWith("http://") || value.startsWith("https://");
}

export function isStoragePath(value: string | null | undefined): boolean {
  return Boolean(value) && !isExternalUrl(value);
}

export function fileNameFromPath(value: string | null | undefined): string {
  if (!value) return "";
  const parts = value.split("/");
  const last = parts[parts.length - 1] ?? "";
  // Strip leading timestamp prefix (e.g., "1701234567-invoice.pdf" → "invoice.pdf")
  return last.replace(/^\d{10,}-/, "");
}

function sanitizeFilename(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(-80);
}

export interface UploadResult {
  path: string;
}

export async function uploadCustomerFile(
  customerId: string,
  category: CustomerFileCategory,
  file: File,
): Promise<UploadResult> {
  const safe = sanitizeFilename(file.name);
  const ts = Math.floor(Date.now() / 1000);
  const path = `${customerId}/${category}/${ts}-${safe}`;

  const { error } = await supabase.storage
    .from(CUSTOMER_FILES_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) throw error;
  return { path };
}

export async function createSignedDownloadUrl(
  storagePath: string,
  ttlSeconds: number = 3600,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(CUSTOMER_FILES_BUCKET)
    .createSignedUrl(storagePath, ttlSeconds);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Failed to create signed URL");
  return data.signedUrl;
}

export async function deleteCustomerFile(storagePath: string): Promise<void> {
  if (!isStoragePath(storagePath)) return; // external URL — leave alone
  const { error } = await supabase.storage
    .from(CUSTOMER_FILES_BUCKET)
    .remove([storagePath]);
  if (error) {
    // Don't throw — file may have already been removed manually
    console.warn("Failed to delete file from storage:", error.message);
  }
}
