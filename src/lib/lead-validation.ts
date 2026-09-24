// src/lib/lead-validation.ts
// Validation shared across quote-request forms (Presence, Connect, ...) and
// the /api/quote-request route handler so client and server agree on what's valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Malaysian mobile numbers: 01X-XXXXXXX (7 digits after prefix, most carriers)
// or 011-XXXXXXXX (8 digits, Yes/Unifi Mobile block). Accepts +60/60/0 leading
// forms and tolerates spaces/dashes, which are stripped before matching.
const MY_PHONE_RE = /^(?:\+?60|0)1(?:1\d{8}|[02-46-9]\d{7})$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidMalaysianPhone(value: string): boolean {
  const digits = value.replace(/[\s-]/g, '');
  return MY_PHONE_RE.test(digits);
}
