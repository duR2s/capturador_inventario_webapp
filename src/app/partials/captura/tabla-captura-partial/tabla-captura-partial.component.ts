import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// --- Angular Material Imports ---
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Componentes
import { TicketCapturaPartialsComponent } from '../ticket-captura-partials/ticket-captura-partials.component';

// Servicios e Interfaces Nuevos
import { CapturaService } from '../../../services/documents/captura.service';
import { DetalleCaptura, Captura } from '../../../captura.interfaces';

@Component({
  selector: 'app-tabla-captura-partial',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './tabla-captura-partial.component.html',
  styleUrls: ['./tabla-captura-partial.component.scss']
})
export class TablaCapturaPartialComponent implements AfterViewInit {

  // Inyección del servicio híbrido (Fuente de Verdad)
  private capturaService = inject(CapturaService);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // CAMBIO: Ahora guardamos todo el objeto Captura, no solo el string del folio.
  // Esto hace disponible toda la info (almacen, fecha, capturador) en el HTML.
  public capturaHeader: Captura | null = null;

  // Columnas a mostrar
  displayedColumns: string[] = ['codigo', 'nombre', 'existencia_previa', 'existencia_capturada', 'diferencia', 'editar', 'ticket', 'eliminar'];

  // DataSource inicializado vacío, se llenará con el servicio
  dataSource = new MatTableDataSource<DetalleCaptura>([]);

  constructor() {
    // 1. SUSCRIPCIÓN A DETALLES (Tabla)
    this.capturaService.detalles$.subscribe((detalles) => {
      this.dataSource.data = detalles;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });

    // 2. SUSCRIPCIÓN A LA CABECERA (Info General Completa)
    this.capturaService.capturaActual$.subscribe((captura: Captura | null) => {
      this.capturaHeader = captura;
      // Ahora tienes disponible this.capturaHeader.almacen, this.capturaHeader.fecha_captura, etc.
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // --- ACCIONES DE UI (Diálogos) ---

  ticketProducto(element: DetalleCaptura): void {
    this.dialog.open(TicketCapturaPartialsComponent, {
      data: { filaSeleccionada: element, generarTicket: true },
      width: '400px',
    });
  }

  editarFila(element: DetalleCaptura): void {
    this.dialog.open(TicketCapturaPartialsComponent, {
      data: { filaSeleccionada: element, generarTicket: false },
      width: '400px',
    });
  }

  // --- LÓGICA HÍBRIDA DE ELIMINACIÓN ---

  eliminarFila(element: DetalleCaptura): void {
    // CASO 1: Elemento pendiente de sincronización (Offline/Cola)
    if (this.esPendiente(element)) {
      alert("Este ítem está pendiente de sincronización. No se puede eliminar hasta que se suba al servidor.");
      return;
    }

    // CASO 2: Elemento ya guardado en BD (Online)
    if (element.id) {
      const confirmacion = confirm(`¿Estás seguro de eliminar el producto ${element.producto_codigo}?`);

      if (confirmacion) {
        this.capturaService.eliminarDetalle(element.id).subscribe({
          next: () => console.log('Elemento eliminado exitosamente del servidor.'),
          error: (err) => {
            console.error('Error al eliminar:', err);
            alert('No se pudo eliminar el registro. Intente nuevamente.');
          }
        });
      }
    }
  }

  esPendiente(detalle: DetalleCaptura): boolean {
    return !detalle.id || !!detalle.pendiente_sync;
  }
}
