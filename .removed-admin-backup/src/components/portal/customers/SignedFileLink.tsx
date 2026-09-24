"use client";

import { useState } from "react";
import {
  createSignedDownloadUrl,
  fileNameFromPath,
  isExternalUrl,
} from "@/lib/portal/storage";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

interface SignedFileLinkProps {
  value: string | null;
  label?: string;
  /** Icon prefix override (default: 📎) */
  icon?: string;
  className?: string;
}

export function SignedFileLink({ value, label, icon = "📎", className }: SignedFileLinkProps) {
  const [loading, setLoading] = useState(false);

  if (!value) return null;

  if (isExternalUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className={className ?? "hover:opacity-80"}
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: "0.12em",
          color: "rgba(0,240,255,0.85)",
        }}
      >
        {icon} {label ?? value.replace(/^https?:\/\//, "").slice(0, 50)} →
      </a>
    );
  }

  const displayLabel = label ?? fileNameFromPath(value);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const url = await createSignedDownloadUrl(value as string);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      alert("Failed to generate download link. The file may have been moved or deleted.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className ?? "hover:opacity-80 disabled:opacity-50"}
      style={{
        fontFamily: MONO,
        fontSize: 10.5,
        letterSpacing: "0.12em",
        color: "rgba(0,240,255,0.85)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
        textAlign: "left",
      }}
    >
      {icon} {loading ? "Opening…" : displayLabel} →
    </button>
  );
}
