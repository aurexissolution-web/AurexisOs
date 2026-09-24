"use client";

import { useRef, useState } from "react";
import {
  uploadCustomerFile,
  fileNameFromPath,
  isExternalUrl,
  type CustomerFileCategory,
} from "@/lib/portal/storage";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
  fontSize: 13,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 6,
  padding: "8px 10px",
  color: "white",
  outline: "none",
  width: "100%",
};

interface FileUploadProps {
  customerId: string;
  category: CustomerFileCategory;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
  placeholder?: string;
  /** Render as compact inline variant (smaller, single-row) instead of full form variant. */
  compact?: boolean;
}

const DEFAULT_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,application/pdf,image/*";

export function FileUpload({
  customerId,
  category,
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  placeholder = "or paste a URL (Google Drive, Dropbox, etc.)",
  compact = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"file" | "url">(
    value && isExternalUrl(value) ? "url" : "file",
  );

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { path } = await uploadCustomerFile(customerId, category, file);
      onChange(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const fileLabel = value
    ? isExternalUrl(value)
      ? value.replace(/^https?:\/\//, "").slice(0, 50)
      : fileNameFromPath(value)
    : null;

  return (
    <div className={compact ? "flex items-center gap-2 w-full" : "space-y-2"}>
      {mode === "file" ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-md border border-white/[0.10] bg-white/[0.02] px-4 py-2 text-[13px] text-white/80 hover:bg-white/[0.05] hover:border-white/[0.20] disabled:opacity-50"
          >
            <span aria-hidden>📎</span>
            {uploading ? "Uploading…" : fileLabel ? "Replace file" : "Choose file"}
          </button>
          {fileLabel && !uploading && (
            <span
              className="truncate"
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: "rgba(255,255,255,0.55)",
                maxWidth: compact ? 240 : "100%",
              }}
            >
              {fileLabel}
            </span>
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-red-400/60 hover:text-red-400"
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Clear
            </button>
          )}
          {!compact && (
            <button
              type="button"
              onClick={() => setMode("url")}
              className="text-white/40 hover:text-white/70"
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginLeft: 8,
              }}
            >
              or paste URL
            </button>
          )}
        </>
      ) : (
        <div className={compact ? "flex items-center gap-2 flex-1" : "flex items-center gap-2"}>
          <input
            type="url"
            placeholder={placeholder}
            value={isExternalUrl(value) ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => {
              setMode("file");
              onChange("");
            }}
            className="text-white/40 hover:text-white/70 shrink-0"
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Upload instead
          </button>
        </div>
      )}
      {error && (
        <p
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            color: "#F87171",
            margin: 0,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
