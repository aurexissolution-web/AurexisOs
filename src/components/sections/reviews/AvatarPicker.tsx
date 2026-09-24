"use client";

import { ReviewAvatar } from "./ReviewAvatar";
import type { ReviewAvatarKey } from "@/types/portal";

const KEYS: ReviewAvatarKey[] = [
  "cyan",
  "violet",
  "emerald",
  "amber",
  "cyan-violet",
  "amber-emerald",
  "silver",
  "constellation",
];

interface AvatarPickerProps {
  value: ReviewAvatarKey;
  onChange: (key: ReviewAvatarKey) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {KEYS.map((key) => {
        const isActive = key === value;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={isActive}
            aria-label={`Avatar ${key}`}
            className="relative flex h-12 w-12 items-center justify-center rounded-full transition-all"
            style={{
              border: isActive
                ? "2px solid #00F0FF"
                : "1px solid rgba(255,255,255,0.10)",
              padding: 2,
              background: isActive ? "rgba(0,240,255,0.06)" : "transparent",
              boxShadow: isActive ? "0 0 16px rgba(0,240,255,0.25)" : "none",
              transform: isActive ? "scale(1.05)" : "scale(1)",
            }}
          >
            <ReviewAvatar avatarKey={key} size={36} />
          </button>
        );
      })}
    </div>
  );
}
