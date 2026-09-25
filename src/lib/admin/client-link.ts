import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import { matchClient, normalizeEmail, normalizePhone, type MatchContact } from './clients';
import { SOURCE_BY_KEY, type LeadSourceKey } from './lead-sources';

const LABEL: Record<LeadSourceKey, string> = {
  presence: 'Presence',
  flow: 'Flow',
  core: 'Core',
  connect: 'Connect',
  audit: 'AI Audit',
  contact: 'contact form',
  calculator: 'calculator',
};

/**
 * Attach a fresh enquiry to a client: an existing one matched by email or phone,
 * or a new Lead. Returns the client id, or null when it could not be linked.
 * Never throws: a website enquiry must never fail because of the client database.
 */
export async function linkEnquiry(o: {
  source: LeadSourceKey;
  leadId: string;
  name: string;
  email: string;
  phone?: string | null;
  headline: string;
}): Promise<string | null> {
  try {
    const email = normalizeEmail(o.email);
    const phone = normalizePhone(o.phone);
    if (!email && !phone) return null;

    const filters = [email && `email_key.eq.${email}`, phone && `phone_key.eq.${phone}`].filter(Boolean);
    const { data: contacts } = await supabaseAdmin
      .from('client_contacts')
      .select('client_id,email_key,phone_key')
      .or(filters.join(','))
      .limit(10);
    const match = matchClient((contacts ?? []) as MatchContact[], { email, phone });
    const now = new Date().toISOString();
    let clientId = match?.clientId ?? null;

    if (clientId) {
      const { data: c } = await supabaseAdmin.from('clients').select('status').eq('id', clientId).single();
      const reopen = c && (c.status === 'past' || c.status === 'lost');
      await supabaseAdmin
        .from('clients')
        .update({ last_contact_at: now, updated_at: now, ...(reopen && { status: 'lead' }) })
        .eq('id', clientId);
      // Matched by phone but a different email: keep the new email as another contact.
      if (match?.by === 'phone' && email) {
        await supabaseAdmin.from('client_contacts').insert({
          client_id: clientId,
          name: o.name.trim(),
          email,
          phone: o.phone ?? '',
          is_primary: false,
        });
      }
      if (reopen) {
        await supabaseAdmin.from('client_activity').insert({
          client_id: clientId,
          kind: 'status_change',
          title: 'Reopened as a lead by a new enquiry',
          occurred_at: now,
        });
      }
    } else {
      const name = o.name.trim() || (email ?? '').split('@')[0] || 'New enquiry';
      const { data: created, error } = await supabaseAdmin
        .from('clients')
        .insert({ name, status: 'lead', source: o.source, first_contact_at: now, last_contact_at: now })
        .select('id')
        .single();
      if (error || !created) throw new Error(error?.message ?? 'client insert failed');
      clientId = created.id as string;
      await supabaseAdmin.from('client_contacts').insert({
        client_id: clientId,
        name,
        email: email ?? '',
        phone: o.phone ?? '',
        is_primary: true,
      });
    }

    await supabaseAdmin.from(SOURCE_BY_KEY[o.source].table).update({ client_id: clientId }).eq('id', o.leadId);
    // The unique (client, ref) index makes a repeat harmless; a duplicate error is ignored.
    await supabaseAdmin.from('client_activity').insert({
      client_id: clientId,
      kind: 'enquiry',
      title: `New ${LABEL[o.source]} enquiry`,
      body: o.headline.slice(0, 400),
      occurred_at: now,
      ref: `${o.source}:${o.leadId}`,
    });
    return clientId;
  } catch (err) {
    console.error('[client-link] failed:', err);
    return null;
  }
}

/** Record an email the site sent to a client. Never throws. */
export async function logEmailSent(clientId: string, subject: string, to: string, emailId?: string) {
  try {
    await supabaseAdmin.from('client_activity').insert({
      client_id: clientId,
      kind: 'email_sent',
      title: subject,
      body: `Sent to ${to}`,
      ref: emailId ? `email:${emailId}` : null,
    });
  } catch (err) {
    console.error('[client-link] email log failed:', err);
  }
}
