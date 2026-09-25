'use client';

// src/components/admin/LoginForm.tsx
import { useActionState, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn } from '@/app/admin/actions';
import { Button, Input, Label } from './ui';

type LoginAction = (prev: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function LoginForm({ action: submit = signIn }: { action?: LoginAction }) {
  const [state, action, pending] = useActionState(submit, undefined);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          placeholder="you@aurexissolution.com"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            required
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-white/40 hover:text-white/80"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-xl border border-red-400/25 bg-red-400/[0.07] px-3.5 py-2.5 text-[13px] text-red-300"
        >
          {state.error}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={pending} className="h-11 w-full">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Sign in <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
