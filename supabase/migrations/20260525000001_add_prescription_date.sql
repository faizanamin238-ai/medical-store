-- Add prescription_date to prescriptions table.
-- The prescriptions table was created with a separate FK design (prescription_id on sales)
-- rather than the plan's prescription_url text column. This is an improvement.
-- This migration fills the one missing column from that table.

alter table public.prescriptions
  add column if not exists prescription_date date;
