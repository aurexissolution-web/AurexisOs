"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchCustomerBySlug } from "@/lib/portal/customer-data";
import { CustomerForm } from "@/components/portal/customers/CustomerForm";
import type { CustomerRecord } from "@/types/portal";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function EditCustomerPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const bundle = await fetchCustomerBySlug(params.slug);
        if (cancelled) return;
        if (!bundle) {
          setError("Customer not found");
          return;
        }
        setCustomer(bundle.customer);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError(e instanceof Error ? e.message : "Failed to load customer");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-center">
        <div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: "#F87171" }}>{error}</p>
          <button onClick={() => router.push("/portal/admin/customers")} className="mt-4 text-[#00F0FF] hover:underline text-[13px]">
            ← Back to all customers
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return <div className="h-32 rounded bg-white/[0.02] animate-pulse max-w-3xl" />;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="border-b border-white/[0.06] pb-6"
      >
        <Link
          href={`/portal/admin/customers/${customer.slug}`}
          className="inline-flex items-center gap-1.5 mb-4 transition-colors hover:text-white"
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.40)",
          }}
        >
          ← {customer.company_name}
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
          Edit customer.
        </h1>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easeOut, delay: 0.05 }}>
        <CustomerForm mode="edit" initial={customer} />
      </motion.div>
    </div>
  );
}
