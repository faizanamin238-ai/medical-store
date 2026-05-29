-- Add tax_rate and receipt_footer to pharmacies
alter table public.pharmacies
  add column if not exists tax_rate  numeric(5,2) not null default 0,
  add column if not exists receipt_footer text;
