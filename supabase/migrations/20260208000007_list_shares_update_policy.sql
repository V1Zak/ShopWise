-- Add update policy on list_shares: only list owners can update shares
create policy "list_shares_update" on list_shares
  for update using (
    exists (
      select 1 from shopping_lists
      where shopping_lists.id = list_shares.list_id
        and shopping_lists.owner_id = auth.uid()
    )
  );

-- Allow users to remove themselves from a shared list (self-delete)
create policy "list_shares_self_delete" on list_shares
  for delete using (
    auth.uid() = user_id
  );
