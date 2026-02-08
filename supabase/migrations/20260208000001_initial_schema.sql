-- ============================================================
-- ShopWise Initial Schema
-- ============================================================

-- Helper: auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- profiles (extends auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ============================================================
-- stores
-- ============================================================
create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo text,
  location text,
  color text not null default '#3b82f6',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger stores_updated_at
  before update on stores
  for each row execute function update_updated_at();

-- ============================================================
-- categories (text PK matching CategoryId type)
-- ============================================================
create table categories (
  id text primary key,
  name text not null,
  icon text not null default 'category',
  aisle int
);

-- ============================================================
-- products
-- ============================================================
create table products (
  id uuid primary key default gen_random_uuid(),
  barcode text,
  name text not null,
  brand text,
  description text,
  category_id text not null references categories(id),
  image_url text,
  unit text not null default 'each',
  average_price numeric(10,2) not null default 0,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on products(category_id);
create index idx_products_barcode on products(barcode) where barcode is not null;

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

-- ============================================================
-- store_products (store-specific pricing)
-- ============================================================
create table store_products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  price numeric(10,2) not null,
  last_updated timestamptz not null default now(),
  unique (store_id, product_id)
);

create index idx_store_products_store on store_products(store_id);
create index idx_store_products_product on store_products(product_id);

-- ============================================================
-- shopping_lists
-- ============================================================
create table shopping_lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  store_id uuid references stores(id),
  is_template boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_shopping_lists_owner on shopping_lists(owner_id);

create trigger shopping_lists_updated_at
  before update on shopping_lists
  for each row execute function update_updated_at();

-- ============================================================
-- list_items
-- ============================================================
create table list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references shopping_lists(id) on delete cascade,
  product_id uuid references products(id),
  name text not null,
  category_id text not null references categories(id),
  quantity int not null default 1,
  unit text not null default 'each',
  estimated_price numeric(10,2) not null default 0,
  actual_price numeric(10,2),
  status text not null default 'to_buy' check (status in ('to_buy', 'in_cart', 'skipped')),
  tags text[] default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_list_items_list on list_items(list_id);

create trigger list_items_updated_at
  before update on list_items
  for each row execute function update_updated_at();

-- ============================================================
-- list_shares
-- ============================================================
create table list_shares (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references shopping_lists(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  permission text not null default 'view' check (permission in ('view', 'edit')),
  created_at timestamptz not null default now(),
  unique (list_id, user_id)
);

create index idx_list_shares_list on list_shares(list_id);
create index idx_list_shares_user on list_shares(user_id);

-- ============================================================
-- price_history
-- ============================================================
create table price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  user_id uuid references profiles(id),
  price numeric(10,2) not null,
  recorded_at timestamptz not null default now()
);

create index idx_price_history_product on price_history(product_id);
create index idx_price_history_store on price_history(store_id);

-- ============================================================
-- shopping_trips
-- ============================================================
create table shopping_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  list_id uuid references shopping_lists(id),
  store_id uuid not null references stores(id),
  date timestamptz not null default now(),
  item_count int not null default 0,
  total_spent numeric(10,2) not null default 0,
  total_saved numeric(10,2) not null default 0,
  efficiency_score int,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_shopping_trips_user on shopping_trips(user_id);
create index idx_shopping_trips_store on shopping_trips(store_id);
