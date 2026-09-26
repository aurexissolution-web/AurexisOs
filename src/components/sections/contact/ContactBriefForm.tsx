// src/components/sections/contact/ContactBriefForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import type { ContactIntent } from '@/types/portal';
import { CONTACT_INTENTS, COMPANY_STAGES, CHANNELS } from '@/data/contact-config';

const SANS = 'var(--font-plus-jakarta), system-ui, sans-serif';

type FormState = 'idle' | 'sending' | 'sent' | 'error';
interface FieldErrors {
  intent?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const inputBase: React.CSSProperties = {
  background: 'rgba(2,4,10,0.5)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 8,
  padding: '12px 14px',
  color: '#f5f5f7',
  fontSize: 14,
  fontFamily: 'inherit',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
};

const labelBase: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#94a3b8',
};

export function ContactBriefForm() {
  const [intent, setIntent] = useState<ContactIntent>('new-project');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [stage, setStage] = useState(COMPANY_STAGES[0]);
  const [message, setMessage] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [topError, setTopError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const website = new FormData(e.currentTarget as HTMLFormElement).get('website');
    setState('sending');
    setErrors({});
    setTopError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, name, email, phone, company, stage, message, website }),
      });
      if (res.ok) {
        setState('sent');
        return;
      }
      if (res.status === 422) {
        const body = (await res.json()) as { errors?: FieldErrors };
        setErrors(body.errors ?? {});
        setState('idle');
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setTopError(body.error ?? 'Something went wrong. Try emailing us directly.');
      setState('error');
    } catch {
      setTopError('Network error. Try emailing us directly.');
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div
        className="flex flex-col items-start"
        style={{
          padding: 32,
          gap: 18,
          background: 'rgba(16,185,129,0.05)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 12,
        }}
      >
        <div
          className="inline-flex items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.4)',
          }}
        >
          <Check className="w-5 h-5" style={{ color: '#10B981' }} />
        </div>
        <h3
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: '-0.015em',
            margin: 0,
            color: '#f5f5f7',
          }}
        >
          Got it — we&rsquo;ll come back to you within a working day.
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: '#94a3b8', margin: 0 }}>
          Look for a reply from <b style={{ color: '#f5f5f7', fontWeight: 500 }}>{CHANNELS.email}</b>. If it&rsquo;s urgent, WhatsApp us on{' '}
          <a
            href={CHANNELS.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#00F0FF',
              borderBottom: '1px solid rgba(0,240,255,0.4)',
              textDecoration: 'none',
            }}
          >
            {CHANNELS.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form className="relative flex flex-col" style={{ gap: 18 }} onSubmit={handleSubmit} noValidate>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      {topError && (
        <p
          style={{
            padding: '10px 14px',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 8,
            color: '#fca5a5',
            fontSize: 13,
            margin: 0,
          }}
        >
          {topError}
        </p>
      )}

      <div className="flex flex-col" style={{ gap: 7 }}>
        <label className="font-mono" style={labelBase}>What are you here for?</label>
        <div className="flex flex-wrap" style={{ gap: 7 }}>
          {CONTACT_INTENTS.map((i) => {
            const active = i.id === intent;
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => setIntent(i.id)}
                className="font-mono"
                style={{
                  padding: '7px 13px',
                  border: `1px solid ${active ? '#00F0FF' : 'rgba(255,255,255,0.10)'}`,
                  borderRadius: 999,
                  fontSize: 10.5,
                  letterSpacing: '0.12em',
                  color: active ? '#02040A' : '#cbd5e1',
                  background: active ? '#00F0FF' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  fontWeight: active ? 700 : 400,
                  transition: 'all 0.2s ease',
                }}
              >
                {i.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="flex flex-col" style={{ gap: 7 }}>
          <label className="font-mono" style={labelBase}>
            Your name <span style={{ color: '#00F0FF', marginLeft: 3 }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maya Ramachandran"
            style={inputBase}
          />
          {errors.name && (
            <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.name}</span>
          )}
        </div>
        <div className="flex flex-col" style={{ gap: 7 }}>
          <label className="font-mono" style={labelBase}>
            Email <span style={{ color: '#00F0FF', marginLeft: 3 }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="maya@orbital.com"
            style={inputBase}
          />
          {errors.email && (
            <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.email}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="flex flex-col" style={{ gap: 7 }}>
          <label className="font-mono" style={labelBase}>
            Phone (WhatsApp) <span style={{ color: '#00F0FF', marginLeft: 3 }}>*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+60 12-345 6789"
            style={inputBase}
          />
          {errors.phone && (
            <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.phone}</span>
          )}
        </div>
        <div className="flex flex-col" style={{ gap: 7 }}>
          <label className="font-mono" style={labelBase}>Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Orbital Treasury"
            style={inputBase}
          />
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: 7 }}>
        <label className="font-mono" style={labelBase}>What do you have today?</label>
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          style={inputBase}
        >
          {COMPANY_STAGES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col" style={{ gap: 7 }}>
        <label className="font-mono" style={labelBase}>
          Tell us about the work <span style={{ color: '#00F0FF', marginLeft: 3 }}>*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What you're building, what's stuck, rough timeline, what success looks like. The more context, the sharper our reply."
          style={{ ...inputBase, resize: 'vertical', minHeight: 130 }}
        />
        {errors.message && (
          <span style={{ color: '#fca5a5', fontSize: 12 }}>{errors.message}</span>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap" style={{ gap: 16, paddingTop: 4 }}>
        <p style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.5, margin: 0 }}>
          We never share your details.
        </p>
        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex items-center transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          style={{
            gap: 10,
            padding: '12px 22px',
            background: '#00F0FF',
            color: '#02040A',
            border: 'none',
            borderRadius: 10,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(0,240,255,0.2)',
            transitionDuration: '0.25s',
          }}
        >
          {state === 'sending' ? 'Sending…' : 'Send the brief'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
