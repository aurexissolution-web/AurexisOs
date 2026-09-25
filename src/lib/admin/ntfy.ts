import 'server-only';

const SERVER = (process.env.NTFY_SERVER || 'https://ntfy.sh').replace(/\/+$/, '');
const TOPIC = process.env.NTFY_TOPIC;

export const ntfyConfigured = Boolean(TOPIC);

// JSON publishing keeps titles and messages UTF-8 safe (headers would not be).
// Returns true when ntfy accepted the message. Never throws.
export async function pushNotification(o: {
  title: string;
  message: string;
  click?: string;
  priority?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}): Promise<boolean> {
  if (!TOPIC) {
    console.warn('[ntfy] NTFY_TOPIC not set, skipped:', o.title);
    return false;
  }
  try {
    const res = await fetch(SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: TOPIC,
        title: o.title,
        message: o.message,
        priority: o.priority ?? 4,
        tags: o.tags ?? ['calendar'],
        ...(o.click && { click: o.click }),
      }),
    });
    if (!res.ok) console.error('[ntfy] non-ok:', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error('[ntfy] failed:', err);
    return false;
  }
}
