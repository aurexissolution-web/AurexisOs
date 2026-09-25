// src/lib/email/ics.ts
// Builds the iCalendar (.ics) file attached to invite emails. Gmail adds a
// REQUEST to Google Calendar and removes it on a CANCEL with the same UID.

export interface IcsInput {
  method: 'REQUEST' | 'CANCEL';
  uid: string;
  sequence: number;
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  url?: string | null;
  description?: string;
  organizerEmail: string;
  attendeeEmail: string;
  alarmMinutes?: number | null;
}

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const esc = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// RFC 5545: lines are at most 75 octets; continuations start with one space.
function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let cur = '';
  let budget = 75;
  for (const ch of line) {
    const size = enc.encode(ch).length;
    if (enc.encode(cur).length + size > budget) {
      parts.push(cur);
      cur = '';
      budget = 74;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts.join('\r\n ');
}

export function buildIcs(o: IcsInput): string {
  const cancelled = o.method === 'CANCEL';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aurexis Solution//Admin Calendar//EN',
    'CALSCALE:GREGORIAN',
    `METHOD:${o.method}`,
    'BEGIN:VEVENT',
    `UID:${o.uid}`,
    `SEQUENCE:${o.sequence}`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(o.startsAt)}`,
    `DTEND:${stamp(o.endsAt)}`,
    `SUMMARY:${esc(o.title)}`,
    ...(o.location ? [`LOCATION:${esc(o.location)}`] : []),
    ...(o.url ? [`URL:${o.url}`] : []),
    ...(o.description ? [`DESCRIPTION:${esc(o.description)}`] : []),
    `ORGANIZER;CN=Aurexis Solution:mailto:${o.organizerEmail}`,
    `ATTENDEE;CN=${o.attendeeEmail};ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=FALSE:mailto:${o.attendeeEmail}`,
    `STATUS:${cancelled ? 'CANCELLED' : 'CONFIRMED'}`,
    'TRANSP:OPAQUE',
    ...(!cancelled && o.alarmMinutes != null
      ? [
          'BEGIN:VALARM',
          'ACTION:DISPLAY',
          'DESCRIPTION:Reminder',
          `TRIGGER:-PT${o.alarmMinutes}M`,
          'END:VALARM',
        ]
      : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
