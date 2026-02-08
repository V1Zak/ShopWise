-- ============================================================
-- Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table stores enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table store_products enable row level security;
alter table shopping_lists enable row level security;
alter table list_items enable row level security;
alter table list_shares enable row level security;
alter table price_history enable row level security;
alter table shopping_trips enable row level security;

-- ============================================================
-- profiles: public read, self update/insert
-- ============================================================
create policy "profiles_select" on profiles
  for select using (true);

create policy "profiles_insert" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update" on profiles
  for update using (auth.uid() = id);

-- ============================================================
-- stores: public read, authenticated write
-- ============================================================
create policy "stores_select" on stores
  for select using (true);

create policy "stores_insert" on stores
  for insert with check (auth.role() = 'authenticated');

create policy "stores_update" on stores
  for update using (auth.role() = 'authenticated');

-- ============================================================
-- categories: public read (seeded, no user writes needed)
-- ============================================================
create policy "categories_select" on categories
  for select using (true);

-- ============================================================
-- products: public read, authenticated write
-- ============================================================
create policy "products_select" on products
  for select using (true);

create policy "products_insert" on products
  for insert with check (auth.role() = 'authenticated');

create policy "products_update" on products
  for update using (auth.role() = 'authenticated');

-- ============================================================
-- store_products: public read, authenticated write
-- ============================================================
create policy "store_products_select" on store_products
  for select using (true);

create policy "store_products_insert" on store_products
  for insert with check (auth.role() = 'authenticated');

create policy "store_products_update" on store_products
  for update using (auth.role() = 'authenticated');

-- ============================================================
-- shopping_lists: owner + shared users read, owner CRUD
-- ============================================================
create policy "shopping_lists_select" on shopping_lists
  for select using (
    auth.uid() = owner_id
    or exists (
      select 1 from list_shares
      where list_shares.list_id = shopping_lists.id
        and list_shares.user_id = auth.uid()
    )
  );

create policy "shopping_lists_insert" on shopping_lists
  for insert with check (auth.uid() = owner_id);

create policy "shopping_lists_update" on shopping_lists
  for update using (auth.uid() = owner_id);

create policy "shopping_lists_delete" on shopping_lists
  for delete using (auth.uid() = owner_id);

-- ============================================================
-- list_items: inherit access from shopping_lists
-- ============================================================
create policy "list_items_select" on list_items
  for select using (
    exists (
      select 1 from shopping_lists
      where shopping_lists.id = list_items.list_id
        and (
          shopping_lists.owner_id = auth.uid()
          or exists (
            select 1 from list_shares
            where list_shares.list_id = shopping_lists.id
              and list_shares.user_id = auth.uid()
          )
        )
    )
  );

create policy "list_items_insert" on list_items
  for insert with check (
    exists (
      select 1 from shopping_lists
      where shopping_lists.id = list_items.list_id
        and (
          shopping_lists.owner_id = auth.uid()
          or exists (
            select 1 from list_shares
            where list_shares.list_id = shopping_lists.id
              and list_shares.user_id = auth.uid()
              and list_shares.permission = 'edit'
          )
        )
    )
  );

create policy "list_items_update" on list_items
  for update using (
    exists (
      select 1 from shopping_lists
      where shopping_lists.id = list_items.list_id
        and (
          shopping_lists.owner_id = auth.uid()
          or exists (
            select 1 from list_shares
            where list_shares.list_id = shopping_lists.id
              and list_shares.user_id = auth.uid()
              and list_shares.permission = 'edit'
          )
        )
    )
  );

create policy "list_items_delete" on list_items
  for delete using (
    exists (
      select 1 from shopping_lists
      where shopping_lists.id = list_items.list_id
        and shopping_lists.owner_id = auth.uid()
    )
  );

-- ============================================================
-- list_shares: only list owners manage
-- ============================================================
create policy "list_shares_select" on list_shares
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from shopping_lists
      where shopping_lists.id = list_shares.list_id
        and shopping_lists.owner_id = auth.uid()
    )
  );

create policy "list_shares_insert" on list_shares
  for insert with check (
    exists (
      select 1 from shopping_lists
      where shopping_lists.id = list_shares.list_id
        and shopping_lists.owner_id = auth.uid()
    )
  );

create policy "list_shares_delete" on list_shares
  for delete using (
    exists (
      select 1 from shopping_lists
      where shopping_lists.id = list_shares.list_id
        and shopping_lists.owner_id = auth.uid()
    )
  );

-- ============================================================
-- price_history: public read, authenticated insert
-- ============================================================
create policy "price_history_select" on price_history
  for select using (true);

create policy "price_history_insert" on price_history
  for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- shopping_trips: user's own only
-- ============================================================
create policy "shopping_trips_select" on shopping_trips
  for select using (auth.uid() = user_id);

create policy "shopping_trips_insert" on shopping_trips
  for insert with check (auth.uid() = user_id);

create policy "shopping_trips_update" on shopping_trips
  for update using (auth.uid() = user_id);

create policy "shopping_trips_delete" on shopping_trips
  for delete using (auth.uid() = user_id);
