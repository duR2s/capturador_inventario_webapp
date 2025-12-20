import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-info-captura-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './info-captura-sidebar.component.html',
  styleUrls: ['./info-captura-sidebar.component.scss']
})
export class InfoCapturaSidebarComponent {
  @Input() captura: any = null;
  @Input() totalArticulos: number = 0;
  @Input() pendientesSincronizar: number = 0;

  @Output() onFinalizar = new EventEmitter<void>();
  @Output() onSincronizar = new EventEmitter<void>();
  @Output() onEliminar = new EventEmitter<void>();
  @Output() onDescargarExcel = new EventEmitter<void>(); // NUEVO EVENTO

  public isOpen: boolean = false;

  constructor() {}

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  ejecutarFinalizar() {
    this.onFinalizar.emit();
  }

  ejecutarSincronizar() {
    this.onSincronizar.emit();
  }

  ejecutarDescargarExcel() {
    this.onDescargarExcel.emit();
  }

  ejecutarEliminar() {
    if (confirm('¿Estás seguro de que deseas ELIMINAR toda la sesión?')) {
      this.onEliminar.emit();
    }
  }
}
