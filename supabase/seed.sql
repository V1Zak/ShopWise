-- ============================================================
-- Seed Data
-- ============================================================

-- Categories (matching CategoryId constants)
insert into categories (id, name, icon, aisle) values
  ('produce',    'Produce',         'nutrition',          1),
  ('dairy',      'Dairy & Eggs',    'egg_alt',            4),
  ('meat',       'Meat & Seafood',  'set_meal',           5),
  ('bakery',     'Bakery',          'bakery_dining',      2),
  ('pantry',     'Pantry Staples',  'kitchen',            7),
  ('beverages',  'Beverages',       'local_cafe',         8),
  ('frozen',     'Frozen',          'ac_unit',             9),
  ('household',  'Household',       'cleaning_services',  10),
  ('snacks',     'Snacks',          'cookie',             6),
  ('other',      'Other',           'category',           null)
on conflict (id) do nothing;

-- Stores
insert into stores (id, name, color, logo) values
  ('00000000-0000-0000-0000-000000000001', 'Walmart',        '#3b82f6', ''),
  ('00000000-0000-0000-0000-000000000002', 'Target',         '#ef4444', ''),
  ('00000000-0000-0000-0000-000000000003', 'Whole Foods',    '#f59e0b', ''),
  ('00000000-0000-0000-0000-000000000004', 'Trader Joe''s',  '#ec4899', ''),
  ('00000000-0000-0000-0000-000000000005', 'Costco',         '#a855f7', ''),
  ('00000000-0000-0000-0000-000000000006', 'Sprouts',        '#22c55e', ''),
  ('00000000-0000-0000-0000-000000000007', 'Safeway',        '#f97316', ''),
  ('00000000-0000-0000-0000-000000000008', 'H-Mart',         '#ea580c', '')
on conflict (id) do nothing;

-- Sample products
insert into products (id, name, brand, category_id, unit, average_price) values
  ('00000000-0000-0000-0001-000000000001', 'Organic Whole Milk',  'Horizon Organic', 'dairy',   '1 Gallon',  5.49),
  ('00000000-0000-0000-0001-000000000002', 'Large Brown Eggs',    'Vital Farms',     'dairy',   '1 Dozen',   7.12),
  ('00000000-0000-0000-0001-000000000003', 'Organic Spinach',     'Private Label',   'produce', '5oz Clamshell', 2.99)
on conflict (id) do nothing;

-- Store-specific pricing for sample products
insert into store_products (store_id, product_id, price) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 4.99),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000001', 5.29),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000001', 6.49),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0001-000000000002', 6.49),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000002', 7.99),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', 2.98),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000003', 2.99)
on conflict (store_id, product_id) do nothing;
