import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingService } from './services/shopping';
import { CatalogItem } from './models/shopping.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  shoppingService = inject(ShoppingService);

  // Formulario para productos personalizados no predefinidos
  customName = '';
  customEmoji = '🛒';
  customComment = '';

  // 🔴 ESTADO DEL MODAL DE CONFIRMACIÓN
  showDeleteModal = false;
  itemToDeleteId: number | null = null;
  itemToDeleteName: string = '';
  isResetAction = false; // Nos permite diferenciar si eliminamos un item o reiniciamos toda la lista

  ngOnInit() {
    this.shoppingService.loadCatalog();
    this.shoppingService.loadShoppingList();
  }

  // Añadir ítem predefinido desde el panel rápido del catálogo
  addFromCatalog(item: CatalogItem) {
    this.shoppingService.addItemToList({
      item_id: item.id,
      comment: ''
    });
  }

  // Añadir un artículo libre/personalizado
  addCustomItem() {
    if (!this.customName.trim()) return;

    this.shoppingService.addItemToList({
      custom_name: this.customName.trim(),
      custom_emoji: this.customEmoji || '🛒',
      comment: this.customComment.trim()
    });

    // Resetear formulario
    this.customName = '';
    this.customComment = '';
    this.customEmoji = '🛒';
  }

  // Marcar como comprado / no comprado
  toggleCompleted(id: number, currentStatus: boolean) {
    this.shoppingService.updateItem(id, { is_completed: !currentStatus });
  }

  // Guardar comentario al perder el foco (blur)
  updateComment(id: number, event: Event) {
    const input = event.target as HTMLInputElement;
    this.shoppingService.updateItem(id, { comment: input.value });
  }

  // 1. Abre el modal para confirmar eliminación de UN producto
  confirmRemoveItem(id: number, name: string) {
    this.isResetAction = false;
    this.itemToDeleteId = id;
    this.itemToDeleteName = name;
    this.showDeleteModal = true;
  }

  // 2. Abre el modal para confirmar la Limpieza/Reinicio de TODA la lista
  onResetList() {
    this.isResetAction = true;
    this.itemToDeleteName = 'toda la lista de la compra';
    this.showDeleteModal = true;
  }

  // 3. Cancela la acción del modal
  cancelDelete() {
    this.showDeleteModal = false;
    this.itemToDeleteId = null;
    this.itemToDeleteName = '';
    this.isResetAction = false;
  }

  // 4. Ejecuta la eliminación según el tipo de acción seleccionada
  executeDelete() {
    if (this.isResetAction) {
      this.shoppingService.resetList();
    } else if (this.itemToDeleteId !== null) {
      this.shoppingService.deleteItem(this.itemToDeleteId);
    }

    this.cancelDelete(); // Cierra y limpia el modal
  }
}
