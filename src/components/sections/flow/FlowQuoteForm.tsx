// src/components/sections/flow/FlowQuoteForm.tsx
'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Check, MapPin, MessageCircle, Video } from 'lucide-react';
import {
  QUOTE_TIER_OPTIONS,
  QUOTE_ACCOUNTING_PACKAGE_OPTIONS,
  QUOTE_ADMIN_HOURS_OPTIONS,
  QUOTE_LHDN_STATUS_OPTIONS,
  QUOTE_TIMELINE_OPTIONS,
  QUOTE_BUDGET_OPTIONS,
  QUOTE_MEETING_OPTIONS,
  FLOW_ACCENT,
  FLOW_ACCENT_RGB,
  FLOW_DEEP_RGB,
  FLOW_WHATSAPP_URL,
} from '@/data/flow-config';
import { isValidEmail, isValidMalaysianPhone } from '@/lib/lead-validation';
import type {
  FlowTier,
  FlowAccountingPackage,
  FlowAdminHours,
  FlowLhdnStatus,
  FlowTimeline,
  FlowBudget,
  FlowMeetingPreference,
  FlowQuoteFieldErrors,
} from '@/types/flow';
import { GlowDivider, SOLUTION_NOISE } from '../solutions/SolutionGlow';
import { FlowSectionLabel } from './FlowSectionLabel';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

const accent = (a: number) => `rgba(${FLOW_ACCENT_RGB},${a})`;

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/30 outline-none transition-colors focus-visible:border-[#7FE8C4]/60 focus-visible:ring-2 focus-visible:ring-[#7FE8C4]/40';

const labelClass = 'font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/45';

const MEETING_META: Record<FlowMeetingPreference, { icon: ReactNode; hint: string }> = {
  Online: { icon: <Video aria-hidden className="h-4 w-4" />, hint: 'Google Meet or Zoom' },
  'Face to face': { icon: <MapPin aria-hidden className="h-4 w-4" />, hint: 'We come to you' },
};

const STEPS = [
  'Send this form — it takes about a minute.',
  'We WhatsApp you within a business day.',
  'We meet online or face to face and scope the automation with you.',
];

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
  className = '',
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className={labelClass} htmlFor={htmlFor}>
        {label} {required && <span style={{ color: FLOW_ACCENT }}>*</span>}
      </label>
      {children}
      {error && <span className="text-[11.5px] text-red-300">{error}</span>}
    </div>
  );
}

function Select<T extends string>({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={inputClass}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-[#0A0B12]">
          {opt}
        </option>
      ))}
    </select>
  );
}

export function FlowQuoteForm() {
  const [tier, setTier] = useState<FlowTier>(QUOTE_TIER_OPTIONS[0]);
  const [businessDescription, setBusinessDescription] = useState('');
  const [accountingPackage, setAccountingPackage] = useState<FlowAccountingPackage>(
    QUOTE_ACCOUNTING_PACKAGE_OPTIONS[0],
  );
  const [adminHoursPerWeek, setAdminHoursPerWeek] = useState<FlowAdminHours>(
    QUOTE_ADMIN_HOURS_OPTIONS[0],
  );
  const [lhdnStatus, setLhdnStatus] = useState<FlowLhdnStatus>(QUOTE_LHDN_STATUS_OPTIONS[0]);
  const [timeline, setTimeline] = useState<FlowTimeline>(QUOTE_TIMELINE_OPTIONS[0]);
  const [budget, setBudget] = useState<FlowBudget>(QUOTE_BUDGET_OPTIONS[0]);
  const [meeting, setMeeting] = useState<FlowMeetingPreference>(QUOTE_MEETING_OPTIONS[0]);
  const [meetingAddress, setMeetingAddress] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<FlowQuoteFieldErrors>({});
  const [topError, setTopError] = useState<string | null>(null);

  const faceToFace = meeting === 'Face to face';

  function validate(): FlowQuoteFieldErrors {
    const next: FlowQuoteFieldErrors = {};
    if (!businessDescription.trim()) next.businessDescription = 'Tell us what your business does.';
    if (faceToFace && !meetingAddress.trim()) next.meetingAddress = 'Tell us where to meet you.';
    if (!name.trim()) next.name = 'Please tell us your name.';
    if (!isValidMalaysianPhone(whatsapp))
      next.whatsapp = 'Enter a valid Malaysian WhatsApp number.';
    if (!isValidEmail(email)) next.email = 'Enter a valid email address.';
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setState('sending');
    setErrors({});
    setTopError(null);
    try {
      const res = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'flow',
          tier,
          businessDescription,
          accountingPackage,
          adminHoursPerWeek,
          lhdnStatus,
          timeline,
          budget,
          meetingPreference: meeting,
          meetingAddress: faceToFace ? meetingAddress : undefined,
          name,
          whatsapp,
          email,
          notes,
        }),
      });

      if (res.ok) {
        setState('sent');
        return;
      }
      if (res.status === 422) {
        const body = (await res.json()) as { errors?: FlowQuoteFieldErrors };
        setErrors(body.errors ?? {});
        setState('idle');
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setTopError(body.error ?? 'Something went wrong. Try WhatsApp instead.');
      setState('error');
    } catch {
      setTopError('Network error. Try WhatsApp instead.');
      setState('error');
    }
  }

  return (
    <section id="get-a-quote" className="relative overflow-hidden px-6 py-12 md:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(40% 55% at 10% 30%, ${accent(0.12)}, transparent 70%), radial-gradient(40% 50% at 95% 90%, rgba(${FLOW_DEEP_RGB},0.2), transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />
      <GlowDivider position="bottom" rgb={FLOW_ACCENT_RGB} />

      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
        <div className="lg:pt-2">
          <FlowSectionLabel>Get a Quote</FlowSectionLabel>
          <h2
            className="font-sans font-extrabold text-white"
            style={{
              fontSize: 'clamp(28px, 3.4vw, 44px)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
            }}
          >
            Tell us about{' '}
            <span className="font-serif italic font-normal" style={{ color: FLOW_ACCENT }}>
              your admin.
            </span>
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-[1.6] text-white/55">
            Tell us what you need. We&apos;ll WhatsApp you within a business day to book a call.
          </p>

          <ol className="mt-8 flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-start gap-3.5">
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-[11px]"
                  style={{
                    borderColor: accent(0.4),
                    background: accent(0.1),
                    color: FLOW_ACCENT,
                  }}
                >
                  {i + 1}
                </span>
                <span className="pt-1 text-[14px] leading-[1.5] text-white/70">{step}</span>
              </li>
            ))}
          </ol>

          <a
            href={FLOW_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 py-2.5 text-[13.5px] text-white/60 transition-colors hover:text-white"
          >
            <MessageCircle aria-hidden className="h-4 w-4" style={{ color: FLOW_ACCENT }} />
            Rather just chat? WhatsApp us directly
            <ArrowRight aria-hidden className="h-3.5 w-3.5" />
          </a>
        </div>

        <div
          className="rounded-3xl border border-white/[0.14] bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl md:p-6"
          style={{
            backgroundImage: 'linear-gradient(140deg, rgba(255,255,255,0.07), transparent 38%)',
          }}
        >
          {state === 'sent' ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
              <span
                className="grid h-14 w-14 place-items-center rounded-full border"
                style={{
                  borderColor: accent(0.45),
                  background: accent(0.14),
                  color: FLOW_ACCENT,
                }}
              >
                <Check aria-hidden className="h-6 w-6" />
              </span>
              <h3 className="max-w-sm text-xl font-semibold text-white">
                Thank you {name.trim() || 'there'} — we&apos;ll WhatsApp you within a business day.
              </h3>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2"
            >
              {topError && (
                <p className="rounded-xl border border-red-400/30 bg-red-400/[0.08] px-4 py-2.5 text-[13px] text-red-300 sm:col-span-2">
                  {topError}
                </p>
              )}

              <Field label="Which Flow tier?" htmlFor="tier">
                <Select id="tier" value={tier} options={QUOTE_TIER_OPTIONS} onChange={setTier} />
              </Field>

              <Field
                label="What does your business do?"
                htmlFor="businessDescription"
                required
                error={errors.businessDescription}
              >
                <input
                  id="businessDescription"
                  type="text"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="e.g. wiring contractor in Kedah"
                  className={inputClass}
                />
              </Field>

              <Field label="Accounting package today" htmlFor="accountingPackage">
                <Select
                  id="accountingPackage"
                  value={accountingPackage}
                  options={QUOTE_ACCOUNTING_PACKAGE_OPTIONS}
                  onChange={setAccountingPackage}
                />
              </Field>

              <Field label="Admin hours a week" htmlFor="adminHoursPerWeek">
                <Select
                  id="adminHoursPerWeek"
                  value={adminHoursPerWeek}
                  options={QUOTE_ADMIN_HOURS_OPTIONS}
                  onChange={setAdminHoursPerWeek}
                />
              </Field>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClass} id="lhdnStatus-label">
                  LHDN e-Invoice status
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="lhdnStatus-label"
                  className="flex flex-wrap gap-2"
                >
                  {QUOTE_LHDN_STATUS_OPTIONS.map((opt) => {
                    const active = opt === lhdnStatus;
                    return (
                      <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setLhdnStatus(opt)}
                        className="rounded-full px-3 py-1.5 text-[12px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FE8C4]/50"
                        style={{
                          border: `1px solid ${active ? FLOW_ACCENT : 'rgba(255,255,255,0.12)'}`,
                          background: active ? FLOW_ACCENT : 'rgba(255,255,255,0.03)',
                          color: active ? '#02040A' : 'rgba(255,255,255,0.75)',
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field label="When do you want it live?" htmlFor="timeline">
                <Select
                  id="timeline"
                  value={timeline}
                  options={QUOTE_TIMELINE_OPTIONS}
                  onChange={setTimeline}
                />
              </Field>

              <Field label="Rough budget" htmlFor="budget">
                <Select
                  id="budget"
                  value={budget}
                  options={QUOTE_BUDGET_OPTIONS}
                  onChange={setBudget}
                />
              </Field>

              <fieldset className="flex flex-col gap-1.5 sm:col-span-2">
                <legend className={`${labelClass} mb-1.5`}>How would you like to meet?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {QUOTE_MEETING_OPTIONS.map((opt) => {
                    const active = opt === meeting;
                    return (
                      <label
                        key={opt}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#7FE8C4]/50"
                        style={{
                          borderColor: active ? accent(0.6) : 'rgba(255,255,255,0.1)',
                          background: active ? accent(0.1) : 'rgba(255,255,255,0.03)',
                        }}
                      >
                        <input
                          type="radio"
                          name="meeting"
                          value={opt}
                          checked={active}
                          onChange={() => setMeeting(opt)}
                          className="sr-only"
                        />
                        <span
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                          style={{
                            background: active ? accent(0.2) : 'rgba(255,255,255,0.06)',
                            color: active ? FLOW_ACCENT : 'rgba(255,255,255,0.55)',
                          }}
                        >
                          {MEETING_META[opt].icon}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13.5px] font-semibold text-white">
                            {opt}
                          </span>
                          <span className="block text-[11.5px] leading-snug text-white/45">
                            {MEETING_META[opt].hint}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div
                className={`grid transition-all duration-300 ease-out sm:col-span-2 ${
                  faceToFace ? 'grid-rows-[1fr] opacity-100' : '-mt-3.5 grid-rows-[0fr] opacity-0'
                }`}
                aria-hidden={!faceToFace}
              >
                <div className="overflow-hidden">
                  <Field
                    label="Where should we meet?"
                    htmlFor="meetingAddress"
                    required
                    error={errors.meetingAddress}
                  >
                    <div className="relative">
                      <MapPin
                        aria-hidden
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                        style={{ color: FLOW_ACCENT }}
                      />
                      <input
                        id="meetingAddress"
                        type="text"
                        autoComplete="street-address"
                        tabIndex={faceToFace ? 0 : -1}
                        value={meetingAddress}
                        onChange={(e) => setMeetingAddress(e.target.value)}
                        placeholder="Your office or shop address, e.g. 12 Jalan Tun Sambanthan, Brickfields, KL"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </Field>
                </div>
              </div>

              <Field label="Your name" htmlFor="name" required error={errors.name}>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmad Zulkifli"
                  className={inputClass}
                />
              </Field>

              <Field label="WhatsApp number" htmlFor="whatsapp" required error={errors.whatsapp}>
                <input
                  id="whatsapp"
                  type="tel"
                  autoComplete="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+60 16-407 1129"
                  className={inputClass}
                />
              </Field>

              <Field label="Email" htmlFor="email" required error={errors.email}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmad@business.com"
                  className={inputClass}
                />
              </Field>

              <Field label="Anything else? (optional)" htmlFor="notes">
                <input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Current process, volumes…"
                  className={inputClass}
                />
              </Field>

              <button
                type="submit"
                disabled={state === 'sending'}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[14px] font-semibold text-[#02040A] transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02040A] sm:col-span-2"
                style={{ background: FLOW_ACCENT, boxShadow: `0 0 30px ${accent(0.3)}` }}
              >
                {state === 'sending' ? 'Sending…' : 'Send Quote Request'}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
