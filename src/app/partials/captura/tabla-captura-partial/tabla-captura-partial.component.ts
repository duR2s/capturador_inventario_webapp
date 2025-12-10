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
import { DetalleCaptura } from '../../../captura.interfaces';

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

  // Columnas a mostrar
  displayedColumns: string[] = ['codigo', 'nombre', 'existencia_previa', 'existencia_capturada', 'diferencia', 'editar', 'ticket', 'eliminar'];

  // DataSource inicializado vacío, se llenará con el servicio
  dataSource = new MatTableDataSource<DetalleCaptura>([]);

  constructor() {
    // SUSCRIPCIÓN REACTIVA:
    // Conectamos la tabla al BehaviorSubject del servicio.
    // Cada vez que se escanea algo (online) o se sincroniza, la tabla se actualiza sola.
    this.capturaService.detalles$.subscribe((detalles) => {
      this.dataSource.data = detalles;
      // Si la tabla crece mucho, podríamos necesitar reasignar el paginador o llamar a _updateChangeSubscription
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
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
    console.log(`Generando ticket para: ${element.producto_codigo}`);
    this.dialog.open(TicketCapturaPartialsComponent, {
      data: { filaSeleccionada: element, generarTicket: true },
      width: '400px',
    });
  }

  editarFila(element: DetalleCaptura): void {
    console.log(`Editando fila: ${element.producto_codigo}`);
    // Nota: Aquí podrías abrir el mismo diálogo de Input para editar cantidad
    this.dialog.open(TicketCapturaPartialsComponent, {
      data: { filaSeleccionada: element, generarTicket: false },
      width: '400px',
    });
  }

  // --- LÓGICA HÍBRIDA DE ELIMINACIÓN ---

  eliminarFila(element: DetalleCaptura): void {
    console.log(`Solicitando eliminar: ${element.producto_codigo}`);

    // CASO 1: Elemento pendiente de sincronización (Offline/Cola)
    if (this.esPendiente(element)) {
      alert("Este ítem está pendiente de sincronización. No se puede eliminar hasta que se suba al servidor.");
      return;
    }

    // CASO 2: Elemento ya guardado en BD (Online)
    if (element.id) {
      const confirmacion = confirm(`¿Estás seguro de eliminar el producto ${element.producto_codigo}?`);

      if (confirmacion) {
        // Llamamos al servicio para borrar del backend
        this.capturaService.eliminarDetalle(element.id).subscribe({
          next: () => {
            console.log('Elemento eliminado exitosamente del servidor.');
            // No hace falta actualizar this.dataSource manualmente aquí,
            // el servicio emitirá el nuevo array en 'detalles$' y el constructor lo capturará.
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            alert('No se pudo eliminar el registro. Intente nuevamente.');
          }
        });
      }
    }
  }

  /**
   * Helper para identificar visualmente si un ítem es local (sin ID real)
   */
  esPendiente(detalle: DetalleCaptura): boolean {
    return !detalle.id || !!detalle.pendiente_sync;
  }
}
