"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { fetchCustomerBySlug, type CustomerDetailBundle } from "@/lib/portal/customer-data";
import { CustomerDetailHeader } from "@/components/portal/customers/CustomerDetailHeader";
import { CustomerTabs, type CustomerTabKey } from "@/components/portal/customers/CustomerTabs";
import { CustomerOverviewTab } from "@/components/portal/customers/CustomerOverviewTab";
import { CustomerProjectsTab } from "@/components/portal/customers/CustomerProjectsTab";
import { CustomerInvoicesTab } from "@/components/portal/customers/CustomerInvoicesTab";
import { CustomerDocumentsTab } from "@/components/portal/customers/CustomerDocumentsTab";
import { CustomerReceiptsTab } from "@/components/portal/customers/CustomerReceiptsTab";

const easeOut = [0.16, 1, 0.3, 1] as const;
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

const VALID_TABS: CustomerTabKey[] = ["overview", "projects", "invoices", "documents", "receipts"];

export default function CustomerDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as CustomerTabKey) || "overview";
  const [activeTab, setActiveTab] = useState<CustomerTabKey>(
    VALID_TABS.includes(initialTab) ? initialTab : "overview",
  );
  const [bundle, setBundle] = useState<CustomerDetailBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchCustomerBySlug(params.slug);
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
          return;
        }
        setBundle(data);
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

  function handleTabChange(tab: CustomerTabKey) {
    setActiveTab(tab);
    const sp = new URLSearchParams(searchParams);
    if (tab === "overview") sp.delete("tab");
    else sp.set("tab", tab);
    router.replace(`?${sp.toString()}`, { scroll: false });
  }

  if (notFound) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-center">
        <div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 28, color: "rgba(255,255,255,0.85)" }}>
            Customer not found.
          </p>
          <button
            onClick={() => router.push("/portal/admin/customers")}
            className="mt-4 text-[#00F0FF] hover:underline text-[13px]"
          >
            ← Back to all customers
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-center">
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: "#F87171" }}>
          {error}
        </p>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="space-y-8 max-w-[1280px]">
        <div className="h-24 rounded bg-white/[0.02] animate-pulse" />
        <div className="h-12 rounded bg-white/[0.02] animate-pulse" />
        <div className="h-64 rounded bg-white/[0.02] animate-pulse" />
      </div>
    );
  }

  const { customer, projects, invoices, documents } = bundle;
  const lifetimePaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const paidCount = invoices.filter((i) => i.status === "paid").length;

  return (
    <div className="space-y-8 max-w-[1280px]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easeOut }}>
        <CustomerDetailHeader
          customer={customer}
          lifetimePaid={lifetimePaid}
          projectCount={projects.length}
        />
      </motion.div>

      <CustomerTabs
        active={activeTab}
        onChange={handleTabChange}
        counts={{
          projects: projects.length,
          invoices: invoices.length,
          documents: documents.length,
          receipts: paidCount,
        }}
      />

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
      >
        {activeTab === "overview" && (
          <CustomerOverviewTab customer={customer} projects={projects} invoices={invoices} documents={documents} />
        )}
        {activeTab === "projects" && <CustomerProjectsTab customerId={customer.id} projects={projects} />}
        {activeTab === "invoices" && <CustomerInvoicesTab customerId={customer.id} invoices={invoices} />}
        {activeTab === "documents" && <CustomerDocumentsTab customerId={customer.id} documents={documents} />}
        {activeTab === "receipts" && <CustomerReceiptsTab customerId={customer.id} invoices={invoices} />}
      </motion.div>
    </div>
  );
}
