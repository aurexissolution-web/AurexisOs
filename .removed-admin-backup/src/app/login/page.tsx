"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ensureUserProfile, postLoginRouteForRole } from "@/lib/supabase/profile";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, Suspense } from "react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const portalLabel = "Admin Portal";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setError("Authenticated but no active session found. Please try again.");
      setSubmitting(false);
      return;
    }

    try {
      const profile = await ensureUserProfile(userData.user);
      const destination = postLoginRouteForRole(profile.role);
      router.push(destination);
      router.refresh();
    } catch (profileError) {
      console.error(profileError);
      setError("Unable to prepare your workspace. Please contact support.");
      setSubmitting(false);
      return;
    }

    setTimeout(() => setSubmitting(false), 5000);
  }

  return (
    <div className={cn("flex w-[100%] flex-col min-h-screen bg-black relative")}>
      <Link href="/" className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors flex items-center z-50">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Site
      </Link>

      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Initial canvas (forward animation) */}
        <div className="absolute inset-0">
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-black"
            colors={[
              [255, 255, 255],
              [255, 255, 255],
            ]}
            dotSize={6}
            reverse={false}
          />
        </div>
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
      </div>
      
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Main content container */}
        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-full max-w-sm px-4">
              <AnimatePresence mode="wait">
                <motion.div 
                  key="login-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8 text-center"
                >
                  <div className="space-y-2">
                    <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                      <Image
                        src="/brand/aurexis-mark.png"
                        alt="Aurexis logo"
                        width={40}
                        height={40}
                        priority
                        className="object-contain"
                      />
                    </div>
                    <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">Welcome Back</h1>
                    <p className="text-[1.5rem] text-white/70 font-light">{portalLabel}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      <div className="relative">
                        <input 
                          type="email" 
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-full py-4 px-6 focus:outline-none focus:border-white/30 text-center transition-colors placeholder:text-white/40"
                          required
                        />
                      </div>
                      <div className="relative">
                        <input 
                          type="password" 
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-full py-4 px-6 focus:outline-none focus:border-white/30 text-center transition-colors placeholder:text-white/40"
                          required
                        />
                      </div>

                      {error && (
                        <div className="text-sm text-red-400 text-center mt-2">{error}</div>
                      )}
                      
                      <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-full bg-white text-black font-semibold py-4 mt-2 hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {submitting ? "Authenticating..." : "Sign In"}
                          {!submitting && <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>}
                        </span>
                      </button>
                    </form>
                  </div>
                  
                  <div className="pt-8 flex items-center justify-center gap-2 text-xs text-white/40">
                    <Shield className="w-3.5 h-3.5" />
                    End-to-End Encrypted via Supabase Auth
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginForm />
    </Suspense>
  );
}
