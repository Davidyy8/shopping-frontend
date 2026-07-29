export interface CatalogItem {
  id: number;
  name: string;
  emoji: string;
  is_custom: boolean;
  created_at: string;
}

export interface ShoppingItem {
  id: number;
  item_id: number | null;
  custom_name: string | null;
  custom_emoji: string;
  comment: string;
  is_completed: boolean;
  created_at: string;
  catalog_item?: CatalogItem;
}

export interface ShoppingItemCreate {
  item_id?: number | null;
  custom_name?: string | null;
  custom_emoji?: string;
  comment?: string;
}

export interface ShoppingItemUpdate {
  comment?: string;
  is_completed?: boolean;
}
