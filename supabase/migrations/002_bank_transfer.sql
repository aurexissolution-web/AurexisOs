-- ══════════════════════════════════════════════════════════════
-- 002: Replace Stripe with Bank Transfer + Receipt Upload
-- ══════════════════════════════════════════════════════════════

-- Add receipt URL column for clients to upload payment proof
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Add payment method column
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'bank_transfer';

-- Rename stripe_payment_url to bank_reference (reuse column)
ALTER TABLE invoices RENAME COLUMN stripe_payment_url TO bank_reference;
