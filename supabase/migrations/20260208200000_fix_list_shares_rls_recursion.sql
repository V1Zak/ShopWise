-- ============================================================
-- Fix infinite recursion in list_shares / shopping_lists RLS
-- ============================================================
-- Problem: shopping_lists_select references list_shares,
--          list_shares_select references shopping_lists → infinite loop
--
-- Solution: Use SECURITY DEFINER function to break the cycle.
-- The function bypasses RLS when checking ownership, preventing recursion.

-- Step 1: Create a SECURITY DEFINER helper function
CREATE OR REPLACE FUNCTION is_list_owner(p_list_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM shopping_lists
    WHERE id = p_list_id AND owner_id = auth.uid()
  );
$$;

-- Step 2: Drop the recursive list_shares policies
DROP POLICY IF EXISTS "list_shares_select" ON list_shares;
DROP POLICY IF EXISTS "list_shares_insert" ON list_shares;
DROP POLICY IF EXISTS "list_shares_delete" ON list_shares;
DROP POLICY IF EXISTS "list_shares_update" ON list_shares;
DROP POLICY IF EXISTS "list_shares_self_delete" ON list_shares;

-- Step 3: Recreate list_shares policies using the helper function
CREATE POLICY "list_shares_select" ON list_shares
  FOR SELECT USING (
    auth.uid() = user_id
    OR is_list_owner(list_id)
  );

CREATE POLICY "list_shares_insert" ON list_shares
  FOR INSERT WITH CHECK (
    is_list_owner(list_id)
  );

CREATE POLICY "list_shares_update" ON list_shares
  FOR UPDATE USING (
    is_list_owner(list_id)
  );

CREATE POLICY "list_shares_delete" ON list_shares
  FOR DELETE USING (
    is_list_owner(list_id)
    OR auth.uid() = user_id
  );

-- Step 4: Also fix list_items policies that reference both tables
DROP POLICY IF EXISTS "list_items_select" ON list_items;
DROP POLICY IF EXISTS "list_items_insert" ON list_items;
DROP POLICY IF EXISTS "list_items_update" ON list_items;

CREATE OR REPLACE FUNCTION can_access_list(p_list_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM shopping_lists
    WHERE id = p_list_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM list_shares
    WHERE list_id = p_list_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION can_edit_list(p_list_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM shopping_lists
    WHERE id = p_list_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM list_shares
    WHERE list_id = p_list_id AND user_id = auth.uid() AND permission = 'edit'
  );
$$;

CREATE POLICY "list_items_select" ON list_items
  FOR SELECT USING (can_access_list(list_id));

CREATE POLICY "list_items_insert" ON list_items
  FOR INSERT WITH CHECK (can_edit_list(list_id));

CREATE POLICY "list_items_update" ON list_items
  FOR UPDATE USING (can_edit_list(list_id));
