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

  // Eliminar elemento de la lista activa
  removeItem(id: number) {
    this.shoppingService.deleteItem(id);
  }

  // Botón de Reiniciar / Finalizar Compra
  onResetList() {
    if (confirm('¿Deseas finalizar la compra y vaciar toda la lista?')) {
      this.shoppingService.resetList();
    }
  }
}
