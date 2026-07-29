import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { CatalogItem, ShoppingItem, ShoppingItemCreate, ShoppingItemUpdate } from '../models/shopping.model';

@Injectable({
  providedIn: 'root'
})
export class ShoppingService {
  // Inicializamos el cliente de Supabase
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  // Signals para el estado reactivo
  catalog = signal<CatalogItem[]>([]);
  shoppingList = signal<ShoppingItem[]>([]);
  loading = signal<boolean>(false);

  constructor() {
    // Escuchar cambios en tiempo real opcionalmente con Supabase Realtime
    this.subscribeToRealtime();
  }

  // --- CATÁLOGO ---
  async loadCatalog() {
    const { data, error } = await this.supabase
      .from('catalog_items')
      .select('*')
      .order('name');

    if (error) console.error('Error cargando catálogo:', error);
    else this.catalog.set(data as CatalogItem[]);
  }

  // --- LISTA DE LA COMPRA ---
  async loadShoppingList() {
    this.loading.set(true);

    // Consulta con relación (JOIN) hacia catalog_items
    const { data, error } = await this.supabase
      .from('shopping_list')
      .select('*, catalog_item:catalog_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando lista:', error);
    } else {
      this.shoppingList.set(data as ShoppingItem[]);
    }
    this.loading.set(false);
  }

  async addItemToList(payload: ShoppingItemCreate) {
    const { data, error } = await this.supabase
      .from('shopping_list')
      .insert([payload])
      .select('*, catalog_item:catalog_items(*)')
      .single();

    if (error) console.error('Error añadiendo elemento:', error);
    else if (data) {
      this.shoppingList.update(list => [data as ShoppingItem, ...list]);
    }
  }

  async updateItem(id: number, payload: ShoppingItemUpdate) {
    const { data, error } = await this.supabase
      .from('shopping_list')
      .update(payload)
      .eq('id', id)
      .select('*, catalog_item:catalog_items(*)')
      .single();

    if (error) console.error('Error actualizando elemento:', error);
    else if (data) {
      this.shoppingList.update(list =>
        list.map(item => item.id === id ? (data as ShoppingItem) : item)
      );
    }
  }

  async deleteItem(id: number) {
    const { error } = await this.supabase
      .from('shopping_list')
      .delete()
      .eq('id', id);

    if (error) console.error('Error eliminando elemento:', error);
    else {
      this.shoppingList.update(list => list.filter(item => item.id !== id));
    }
  }

  // REINICIAR / VACIAR TODA LA LISTA
  async resetList() {
    const { error } = await this.supabase
      .from('shopping_list')
      .delete()
      .neq('id', 0); // Borra todas las filas donde ID no sea 0

    if (error) console.error('Error al reiniciar la lista:', error);
    else {
      this.shoppingList.set([]); // Vaciamos el estado local
    }
  }

  // ✨ BONUS: Sincronización en tiempo real nativa de Supabase
  private subscribeToRealtime() {
    this.supabase
      .channel('public:shopping_list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shopping_list' },
        () => this.loadShoppingList() // Recarga cuando haya cambios desde cualquier dispositivo
      )
      .subscribe();
  }
}
