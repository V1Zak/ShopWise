export type SharePermission = 'view' | 'edit';

export interface ListShare {
  id: string;
  listId: string;
  userId: string;
  permission: SharePermission;
  createdAt: string;
  userEmail?: string;
  userName?: string;
  userAvatarUrl?: string;
}

export interface ShoppingList {
  id: string;
  ownerId: string;
  title: string;
  storeId?: string;
  storeName?: string;
  isTemplate: boolean;
  itemCount: number;
  estimatedTotal: number;
  createdAt: string;
  updatedAt: string;
  sharedPermission?: SharePermission;
  collaboratorCount?: number;
}
