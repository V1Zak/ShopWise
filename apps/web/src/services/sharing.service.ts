import { supabase } from '@/lib/supabase';
import type { ListShare, SharePermission } from '@shopwise/shared';

export const sharingService = {
  async shareList(listId: string, email: string, permission: SharePermission): Promise<ListShare> {
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('id, email, name, avatar_url').eq('email', email).single();
    if (profileError || !profile) throw new Error('No user found with that email address');
    const { data: { user } } = await supabase.auth.getUser();
    if (user && profile.id === user.id) throw new Error('You cannot share a list with yourself');
    const { data: existing } = await supabase
      .from('list_shares').select('id').eq('list_id', listId).eq('user_id', profile.id).maybeSingle();
    if (existing) throw new Error('This list is already shared with that user');
    const { data, error } = await supabase
      .from('list_shares').insert({ list_id: listId, user_id: profile.id, permission }).select().single();
    if (error) throw error;
    return {
      id: data.id, listId: data.list_id, userId: data.user_id, permission: data.permission,
      createdAt: data.created_at, userEmail: profile.email, userName: profile.name, userAvatarUrl: profile.avatar_url,
    };
  },

  async getSharedUsers(listId: string): Promise<ListShare[]> {
    const { data, error } = await supabase
      .from('list_shares')
      .select('id, list_id, user_id, permission, created_at, profiles ( email, name, avatar_url )')
      .eq('list_id', listId).order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => {
      const profile = row.profiles as unknown as { email: string; name: string; avatar_url: string } | null;
      return {
        id: row.id, listId: row.list_id, userId: row.user_id,
        permission: row.permission as SharePermission, createdAt: row.created_at,
        userEmail: profile?.email, userName: profile?.name, userAvatarUrl: profile?.avatar_url,
      };
    });
  },

  async removeShare(shareId: string): Promise<void> {
    const { error } = await supabase.from('list_shares').delete().eq('id', shareId);
    if (error) throw error;
  },

  async updateSharePermission(shareId: string, permission: SharePermission): Promise<void> {
    const { error } = await supabase.from('list_shares').update({ permission }).eq('id', shareId);
    if (error) throw error;
  },

  async getSharedWithMe(): Promise<Array<{
    share: { id: string; permission: SharePermission; createdAt: string };
    list: { id: string; ownerId: string; title: string; storeId: string | null; storeName: string | null; isTemplate: boolean; itemCount: number; createdAt: string; updatedAt: string };
  }>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('list_shares')
      .select('id, permission, created_at, shopping_lists ( id, owner_id, title, store_id, is_template, created_at, updated_at, stores ( name ), list_items ( id ) )')
      .eq('user_id', user.id);
    if (error) throw error;
    return (data ?? []).map((row) => {
      const sl = row.shopping_lists as unknown as Record<string, unknown>;
      return {
        share: { id: row.id, permission: row.permission as SharePermission, createdAt: row.created_at },
        list: {
          id: sl.id as string, ownerId: sl.owner_id as string, title: sl.title as string,
          storeId: sl.store_id as string | null,
          storeName: (sl.stores as Record<string, string> | null)?.name ?? null,
          isTemplate: sl.is_template as boolean,
          itemCount: Array.isArray(sl.list_items) ? sl.list_items.length : 0,
          createdAt: sl.created_at as string, updatedAt: sl.updated_at as string,
        },
      };
    });
  },
};
