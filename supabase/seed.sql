-- Demo seed data for RxManager
-- ============================================================
-- To create a demo account:
--   1. Sign up at /signup with demo@rxmanager.app / Demo1234!
--   2. Run this file in Supabase SQL Editor (Dashboard → SQL Editor → New query).
--   3. The demo pharmacy will be pre-populated with medicines,
--      customers, suppliers, sales, and purchases.
-- ============================================================

-- NOTE: This seed looks up the pharmacy named 'Demo Pharmacy' that was
-- created when you signed up. Sign up first, then run this script.

do $$
declare
  demo_pharmacy_id uuid;
  sup1 uuid; sup2 uuid;
  med1 uuid; med2 uuid; med3 uuid; med4 uuid; med5 uuid;
  med6 uuid; med7 uuid; med8 uuid;
  cust1 uuid; cust2 uuid; cust3 uuid;
  sale1 uuid; sale2 uuid;
  purchase1 uuid;
begin
  -- ── Pharmacy ──────────────────────────────────────────────
  select id into demo_pharmacy_id
    from public.pharmacies
   where name = 'Demo Pharmacy'
   limit 1;

  if demo_pharmacy_id is null then
    raise notice 'Demo pharmacy not found. Sign up first at /signup then re-run seed.';
    return;
  end if;

  -- ── Suppliers ─────────────────────────────────────────────
  insert into public.suppliers (pharmacy_id, name, contact_person, phone, email, address)
  values
    (demo_pharmacy_id, 'MedLine Distributors', 'Ali Hassan', '+92-300-1234567', 'ali@medline.pk', 'Karachi, Pakistan'),
    (demo_pharmacy_id, 'PharmaPak Wholesale',  'Sara Khan',  '+92-321-9876543', 'sara@pharmapak.pk', 'Lahore, Pakistan')
  ;

  select id into sup1 from public.suppliers where pharmacy_id = demo_pharmacy_id and name = 'MedLine Distributors';
  select id into sup2 from public.suppliers where pharmacy_id = demo_pharmacy_id and name = 'PharmaPak Wholesale';

  -- ── Medicines ─────────────────────────────────────────────
  -- Note: medicines table uses category_id (FK to categories), not a text category column.
  -- Seeding without categories for simplicity.
  insert into public.medicines (pharmacy_id, name, generic_name, unit, purchase_price, sale_price, stock_quantity, reorder_level, expiry_date, batch_number)
  values
    (demo_pharmacy_id, 'Panadol 500mg',    'Paracetamol',              'Strip',  35,  55,  120, 20, current_date + interval '18 months', 'BN-001'),
    (demo_pharmacy_id, 'Augmentin 625mg',  'Amoxicillin+Clavulanate',  'Strip', 320, 480,  40,  10, current_date + interval '12 months', 'BN-002'),
    (demo_pharmacy_id, 'Ventolin Inhaler', 'Salbutamol',               'Piece', 280, 400,  25,   5, current_date + interval '24 months', 'BN-003'),
    (demo_pharmacy_id, 'Glucophage 500mg', 'Metformin',                'Strip',  55,  85,  80,  15, current_date + interval '15 months', 'BN-004'),
    (demo_pharmacy_id, 'Disprin 300mg',    'Aspirin',                  'Strip',  20,  35, 200,  30, current_date + interval '20 months', 'BN-005'),
    (demo_pharmacy_id, 'Nexium 40mg',      'Esomeprazole',             'Strip', 180, 260,  60,  10, current_date + interval '14 months', 'BN-006'),
    (demo_pharmacy_id, 'Brufen 400mg',     'Ibuprofen',                'Strip',  45,  70,  15,  20, current_date + interval '16 months', 'BN-007'),
    (demo_pharmacy_id, 'Calpol Syrup',     'Paracetamol',              'Bottle', 95, 140,   5,  10, current_date + interval '10 months', 'BN-008')
  ;

  select id into med1 from public.medicines where pharmacy_id = demo_pharmacy_id and name = 'Panadol 500mg';
  select id into med2 from public.medicines where pharmacy_id = demo_pharmacy_id and name = 'Augmentin 625mg';
  select id into med3 from public.medicines where pharmacy_id = demo_pharmacy_id and name = 'Ventolin Inhaler';
  select id into med4 from public.medicines where pharmacy_id = demo_pharmacy_id and name = 'Glucophage 500mg';
  select id into med5 from public.medicines where pharmacy_id = demo_pharmacy_id and name = 'Disprin 300mg';
  select id into med6 from public.medicines where pharmacy_id = demo_pharmacy_id and name = 'Nexium 40mg';
  select id into med7 from public.medicines where pharmacy_id = demo_pharmacy_id and name = 'Brufen 400mg';
  select id into med8 from public.medicines where pharmacy_id = demo_pharmacy_id and name = 'Calpol Syrup';

  -- ── Customers ─────────────────────────────────────────────
  insert into public.customers (pharmacy_id, name, phone)
  values
    (demo_pharmacy_id, 'Ahmed Malik',  '+92-333-1111222'),
    (demo_pharmacy_id, 'Fatima Noor',  '+92-311-3334444'),
    (demo_pharmacy_id, 'Usman Tariq',  '+92-321-5556666')
  ;

  select id into cust1 from public.customers where pharmacy_id = demo_pharmacy_id and name = 'Ahmed Malik';
  select id into cust2 from public.customers where pharmacy_id = demo_pharmacy_id and name = 'Fatima Noor';
  select id into cust3 from public.customers where pharmacy_id = demo_pharmacy_id and name = 'Usman Tariq';

  -- ── Sales ─────────────────────────────────────────────────
  insert into public.sales (pharmacy_id, customer_id, subtotal, discount, tax, total, payment_method, created_at)
  values
    (demo_pharmacy_id, cust1, 680, 0,  0, 680, 'cash', now() - interval '2 days'),
    (demo_pharmacy_id, cust2, 800, 50, 0, 750, 'card', now() - interval '1 day')
  ;

  select id into sale1 from public.sales where pharmacy_id = demo_pharmacy_id and customer_id = cust1;
  select id into sale2 from public.sales where pharmacy_id = demo_pharmacy_id and customer_id = cust2;

  -- ── Sale items ────────────────────────────────────────────
  insert into public.sale_items (sale_id, medicine_id, quantity, unit_price, total, pharmacy_id)
  values
    (sale1, med1, 3,  55,  165, demo_pharmacy_id),
    (sale1, med4, 3,  85,  255, demo_pharmacy_id),
    (sale1, med6, 1, 260,  260, demo_pharmacy_id);

  insert into public.sale_items (sale_id, medicine_id, quantity, unit_price, total, pharmacy_id)
  values
    (sale2, med3, 2, 400, 800, demo_pharmacy_id);

  -- Decrement stock to reflect the above sales
  update public.medicines set stock_quantity = stock_quantity - 3 where id = med1;
  update public.medicines set stock_quantity = stock_quantity - 3 where id = med4;
  update public.medicines set stock_quantity = stock_quantity - 1 where id = med6;
  update public.medicines set stock_quantity = stock_quantity - 2 where id = med3;

  -- ── Purchase ──────────────────────────────────────────────
  insert into public.purchases (pharmacy_id, supplier_id, invoice_number, invoice_date, total_amount, payment_status, created_at)
  values
    (demo_pharmacy_id, sup1, 'INV-2024-001', current_date - interval '7 days', 3825, 'paid', now() - interval '7 days')
  returning id into purchase1;

  insert into public.purchase_items (purchase_id, medicine_id, quantity, unit_cost, total_cost, pharmacy_id)
  values
    (purchase1, med1, 50, 35, 1750, demo_pharmacy_id),
    (purchase1, med5, 70, 20, 1400, demo_pharmacy_id),
    (purchase1, med7, 15, 45,  675, demo_pharmacy_id);

  raise notice 'Demo seed data loaded successfully for pharmacy_id = %', demo_pharmacy_id;
end $$;
