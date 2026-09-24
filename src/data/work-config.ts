// src/data/work-config.ts
// Static, non-case-study content for /work and /work/[slug].

export const WORK_ACCENT = '#5EE3DA';
export const WORK_ACCENT_RGB = '94,227,218';

export function workWhatsappUrl(clientName?: string): string {
  const message = clientName
    ? `Hi Aurexis, I saw the ${clientName} case study and would like to talk about a project.`
    : "Hi Aurexis, I'd like to talk about a project.";
  return `https://wa.me/60164071129?text=${encodeURIComponent(message)}`;
}
