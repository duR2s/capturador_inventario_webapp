import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-info-captura-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './info-captura-sidebar.component.html',
  styleUrls: ['./info-captura-sidebar.component.scss']
})
export class InfoCapturaSidebarComponent implements OnInit {
  @Input() captura: any = null;
  @Input() totalArticulos: number = 0;
  @Input() pendientesSincronizar: number = 0;

  @Output() onFinalizar = new EventEmitter<void>();
  @Output() onSincronizar = new EventEmitter<void>();
  @Output() onEliminar = new EventEmitter<void>();
  @Output() onDescargarExcel = new EventEmitter<void>();

  public isOpen: boolean = false;
  public isAdmin: boolean = false;

  private facadeService = inject(FacadeService);

  constructor() {}

  ngOnInit(): void {
    this.checkUserRole();
    alert(this.captura.estado);
  }

  private checkUserRole() {
    const rol = this.facadeService.getUserGroup();
    this.isAdmin = (rol === 'ADMIN');
  }

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
    // Validación de seguridad adicional antes de emitir
    if (this.captura?.estado !== 'BORRADOR' && !this.isAdmin) {
      return;
    }

    this.onEliminar.emit();
  }
}
