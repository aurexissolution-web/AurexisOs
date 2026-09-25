-- 038_accounts.sql
-- /accounts: income (linked to Documents invoices), payments (linked to
-- receipts), expenses, and referral rewards. Written only by server actions
-- (service role) after an access check, so RLS stays ON with no policies.
--
-- Who may open /accounts (separate from admin and from Documents). Create the
-- person in Supabase Auth first, then:
--   INSERT INTO accounts_access (user_id)
--   SELECT id FROM auth.users WHERE email = 'you@example.com';
CREATE TABLE IF NOT EXISTS accounts_access (
  user_id     UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE accounts_access ENABLE ROW LEVEL SECURITY;

-- Money we are owed. One row per invoice (document_id) or per manual entry.
CREATE TABLE IF NOT EXISTS account_income (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  income_date  DATE          NOT NULL DEFAULT CURRENT_DATE,
  client_id    UUID          REFERENCES clients(id) ON DELETE SET NULL,
  client_name  TEXT          NOT NULL DEFAULT '' CHECK (char_length(client_name) <= 160),
  project      TEXT          NOT NULL DEFAULT '' CHECK (char_length(project) <= 200),
  description  TEXT          NOT NULL DEFAULT '' CHECK (char_length(description) <= 400),
  amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  document_id  UUID          REFERENCES documents(id) ON DELETE SET NULL,
  notes        TEXT          NOT NULL DEFAULT '' CHECK (char_length(notes) <= 2000),
  created_by   UUID,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS account_income_document_uniq ON account_income (document_id) WHERE document_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS account_income_date_idx ON account_income (income_date DESC);
CREATE INDEX IF NOT EXISTS account_income_client_idx ON account_income (client_id) WHERE client_id IS NOT NULL;
ALTER TABLE account_income ENABLE ROW LEVEL SECURITY;

-- Money received against an income row. A receipt from Documents is one payment.
CREATE TABLE IF NOT EXISTS account_payments (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  income_id   UUID          NOT NULL REFERENCES account_income(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  paid_on     DATE          NOT NULL DEFAULT CURRENT_DATE,
  method      TEXT          NOT NULL DEFAULT '' CHECK (char_length(method) <= 60),
  reference   TEXT          NOT NULL DEFAULT '' CHECK (char_length(reference) <= 120),
  receipt_id  UUID          REFERENCES documents(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS account_payments_receipt_uniq ON account_payments (receipt_id) WHERE receipt_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS account_payments_income_idx ON account_payments (income_id);
CREATE INDEX IF NOT EXISTS account_payments_date_idx ON account_payments (paid_on DESC);
ALTER TABLE account_payments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS account_expenses (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date  DATE          NOT NULL DEFAULT CURRENT_DATE,
  category      TEXT          NOT NULL CHECK (char_length(btrim(category)) BETWEEN 1 AND 80),
  vendor        TEXT          NOT NULL DEFAULT '' CHECK (char_length(vendor) <= 160),
  amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  notes         TEXT          NOT NULL DEFAULT '' CHECK (char_length(notes) <= 2000),
  created_by    UUID,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS account_expenses_date_idx ON account_expenses (expense_date DESC);
ALTER TABLE account_expenses ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS referrers (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 160),
  phone         TEXT        NOT NULL DEFAULT '' CHECK (char_length(phone) <= 40),
  bank_name     TEXT        NOT NULL DEFAULT '' CHECK (char_length(bank_name) <= 80),
  bank_account  TEXT        NOT NULL DEFAULT '' CHECK (char_length(bank_account) <= 60),
  notes         TEXT        NOT NULL DEFAULT '' CHECK (char_length(notes) <= 2000),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE referrers ENABLE ROW LEVEL SECURITY;

-- A client someone referred to us, and the reward we owe them for it. The
-- reward becomes payable when the linked income is paid (pay_when). Paying it
-- writes an expense (category "Referral fees") so profit stays right.
CREATE TABLE IF NOT EXISTS referrals (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID          NOT NULL REFERENCES referrers(id) ON DELETE RESTRICT,
  client_id     UUID          REFERENCES clients(id) ON DELETE SET NULL,
  client_name   TEXT          NOT NULL DEFAULT '' CHECK (char_length(client_name) <= 160),
  project       TEXT          NOT NULL DEFAULT '' CHECK (char_length(project) <= 200),
  income_id     UUID          REFERENCES account_income(id) ON DELETE SET NULL,
  base_amount   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (base_amount >= 0),
  reward_kind   TEXT          NOT NULL DEFAULT 'percent' CHECK (reward_kind IN ('percent','fixed')),
  reward_value  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (reward_value >= 0),
  reward_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (reward_amount >= 0),
  pay_when      TEXT          NOT NULL DEFAULT 'full' CHECK (pay_when IN ('full','first_payment')),
  paid_on       DATE,
  pay_method    TEXT          NOT NULL DEFAULT '' CHECK (char_length(pay_method) <= 60),
  pay_reference TEXT          NOT NULL DEFAULT '' CHECK (char_length(pay_reference) <= 120),
  expense_id    UUID          REFERENCES account_expenses(id) ON DELETE SET NULL,
  notes         TEXT          NOT NULL DEFAULT '' CHECK (char_length(notes) <= 2000),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS referrals_income_idx ON referrals (income_id) WHERE income_id IS NOT NULL;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
