-- Migration 009: Add admin_reply column to tickets table
-- This allows admins to reply to client tickets directly

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS admin_reply TEXT;
