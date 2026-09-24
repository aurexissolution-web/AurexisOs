"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "valid" | "error" | "creating" | "success">("loading");
  const [inviteData, setInviteData] = useState<{ email: string; role: string } | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validateToken() {
      try {
        const res = await fetch(`/api/invite?token=${encodeURIComponent(token)}`);
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "Invalid invite link");
          setStatus("error");
          return;
        }

        setInviteData({ email: json.data.email, role: json.data.role });
        setStatus("valid");
      } catch {
        setError("Failed to validate invite link. Please try again.");
        setStatus("error");
      }
    }
    validateToken();
  }, [token]);

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("creating");

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to create account.");
        setStatus("valid");
        return;
      }

      setStatus("success");

      const portalPath = json.role === "admin" ? "/portal/admin" : "/contact";

      setTimeout(() => {
        router.push(`/login?redirect=${encodeURIComponent(portalPath)}`);
      }, 2500);
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("valid");
    }
  }

  return (
    <div className={cn("flex w-full flex-col min-h-screen bg-black relative")}>
      <Link href="/" className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors flex items-center z-50">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Site
      </Link>

      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[#00F0FF]/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-[#7C3AED]/5 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center items-center px-4">
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
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

              {status === "loading" && (
                <>
                  <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin mx-auto" />
                  <p className="text-white/50 text-sm mt-4">Validating invite link...</p>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">Invalid Invite</h1>
                  <p className="text-white/50 text-sm">{error}</p>
                  <Link
                    href="/login"
                    className="inline-block mt-6 px-6 py-3 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    Go to Login
                  </Link>
                </>
              )}

              {status === "success" && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">Account Created!</h1>
                  <p className="text-white/50 text-sm">Redirecting you to sign in...</p>
                </>
              )}

              {(status === "valid" || status === "creating") && inviteData && (
                <>
                  <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-white">
                    Create Your Account
                  </h1>
                  <p className="text-white/50 text-sm">
                    You have been invited as{" "}
                    <span className="text-[#00F0FF] font-medium capitalize">{inviteData.role}</span>
                  </p>

                  <form onSubmit={handleCreateAccount} className="flex flex-col gap-4 mt-6 text-left">
                    <div>
                      <input
                        type="email"
                        value={inviteData.email}
                        disabled
                        className="w-full bg-white/5 backdrop-blur-md text-white/50 border border-white/10 rounded-full py-4 px-6 text-center text-sm cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Create Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-full py-4 px-6 focus:outline-none focus:border-white/30 text-center transition-colors placeholder:text-white/40"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-full py-4 px-6 focus:outline-none focus:border-white/30 text-center transition-colors placeholder:text-white/40"
                        required
                        minLength={6}
                      />
                    </div>

                    {error && (
                      <div className="text-sm text-red-400 text-center">{error}</div>
                    )}

                    <button
                      type="submit"
                      disabled={status === "creating"}
                      className="w-full rounded-full bg-white text-black font-semibold py-4 mt-2 hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === "creating" ? "Creating Account..." : "Create Account"}
                    </button>
                  </form>

                  <p className="text-white/30 text-xs mt-4">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#00F0FF] hover:underline">
                      Sign in
                    </Link>
                  </p>
                </>
              )}
            </div>

            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-white/40">
              <Shield className="w-3.5 h-3.5" />
              End-to-End Encrypted via Supabase Auth
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
