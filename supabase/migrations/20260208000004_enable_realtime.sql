-- Enable Realtime for list_items and shopping_lists tables
alter publication supabase_realtime add table list_items;
alter publication supabase_realtime add table shopping_lists;
