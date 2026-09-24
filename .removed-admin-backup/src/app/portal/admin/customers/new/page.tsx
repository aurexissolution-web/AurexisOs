"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CustomerForm } from "@/components/portal/customers/CustomerForm";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function NewCustomerPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="border-b border-white/[0.06] pb-6"
      >
        <Link
          href="/portal/admin/customers"
          className="inline-flex items-center gap-1.5 mb-4 transition-colors hover:text-white"
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.40)",
          }}
        >
          ← All Customers
        </Link>
        <h1
          className="leading-none tracking-tight"
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "clamp(36px, 4.5vw, 48px)",
            color: "white",
            margin: 0,
          }}
        >
          New customer.
        </h1>
        <p
          className="mt-3"
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 15,
            color: "rgba(255,255,255,0.55)",
            margin: 0,
          }}
        >
          Just the company name is required — everything else can be filled in later.
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut, delay: 0.05 }}
      >
        <CustomerForm mode="create" />
      </motion.div>
    </div>
  );
}
