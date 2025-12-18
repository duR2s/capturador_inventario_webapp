import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Captura } from '../../../captura.interfaces'; // Ajusta la ruta

@Component({
  selector: 'app-captura-info-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './captura-info-card.component.html',
  styleUrls: ['./captura-info-card.component.scss']
})
export class CapturaInfoCardComponent {

  // Si captura es null/undefined, mostramos la tarjeta "Vacía/Nuevo"
  @Input() captura: Captura | null = null;

  // Evento al hacer click en la tarjeta
  @Output() onClick = new EventEmitter<void>();

  constructor() {}

  // Helpers para determinar estilo según estado
  get statusColorClass(): string {
    if (!this.captura) return '';
    switch (this.captura.estado) {
      case 'BORRADOR': return 'status-orange';
      case 'CONFIRMADO': return 'status-green';
      case 'PROCESADO': return 'status-blue';
      default: return 'status-gray';
    }
  }

  get statusText(): string {
    if (!this.captura) return '';
    switch (this.captura.estado) {
      case 'BORRADOR': return 'Pendiente';
      case 'CONFIRMADO': return 'Sincronización Local';
      case 'PROCESADO': return 'Sincronizado';
      default: return 'Desconocido';
    }
  }

  handleClick() {
    this.onClick.emit();
  }
}
