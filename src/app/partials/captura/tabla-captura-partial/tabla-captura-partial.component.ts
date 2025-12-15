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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Componentes
import { ConfirmationDialogModalComponent } from '../../../modals/utilities/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { EditarDetalleModalComponent, EditModalData } from '../../../modals/captura/editar-detalle-modal/editar-detalle-modal.component';

// Servicios e Interfaces
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
    MatSnackBarModule
  ],
  templateUrl: './tabla-captura-partial.component.html',
  styleUrls: ['./tabla-captura-partial.component.scss']
})
export class TablaCapturaPartialComponent implements AfterViewInit {

  private capturaService = inject(CapturaService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public capturaHeader: Captura | null = null;

  // Columnas
  displayedColumns: string[] = ['codigo', 'nombre', 'existencia_previa', 'existencia_capturada', 'diferencia', 'editar', 'ticket', 'eliminar'];

  dataSource = new MatTableDataSource<DetalleCaptura>([]);

  constructor() {
    this.capturaService.detalles$.subscribe((detalles) => {
      this.dataSource.data = detalles;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });

    this.capturaService.capturaActual$.subscribe((captura: Captura | null) => {
      this.capturaHeader = captura;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // ==========================================================================
  // LÓGICA DE EDICIÓN Y TICKET
  // ==========================================================================

  editarFila(element: DetalleCaptura): void {
    const dialogRef = this.dialog.open(EditarDetalleModalComponent, {
      data: {
        mode: 'edit',
        item: {
            codigo: element.producto_codigo,
            nombre: element.articulo_nombre,
            cantidad: element.cantidad_contada,
            //imagen: element.imagen_url
        }
      } as EditModalData,
      width: '450px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // result trae { codigo, cantidad }
        // Se llama al servicio real para actualizar
        this.actualizarCantidad(element.id, result.cantidad, element.articulo_nombre);
      }
    });
  }

  ticketProducto(element: DetalleCaptura): void {
    const dialogRef = this.dialog.open(EditarDetalleModalComponent, {
      data: {
        mode: 'ticket',
        item: {
            codigo: element.producto_codigo,
            nombre: element.articulo_nombre,
            cantidad: 1, // Por defecto 1 ticket o etiqueta
            //imagen: element.imagen_url
        }
      } as EditModalData,
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // result trae { cantidad, responsable, ... }
        this.generarTicket(element, result.cantidad, result.responsable);
      }
    });
  }

  // ==========================================================================
  // MÉTODOS DE SERVICIO (CONECTADOS AL BACKEND)
  // ==========================================================================

  private actualizarCantidad(id: any, cantidad: number, nombreArticulo: any) {
    this.capturaService.actualizarDetalle(id, cantidad).subscribe({
      next: (itemActualizado) => {
        this.mostrarSnack(`Actualizado: ${nombreArticulo}`, 'success');
        // No es necesario actualizar dataSource manualmente, el servicio actualiza el Subject
      },
      error: (err) => {
        console.error(err);
        this.mostrarSnack('Error al actualizar la cantidad.', 'error');
      }
    });
  }

  private generarTicket(element: DetalleCaptura, cantidad: number, responsable: string) {
      this.capturaService.imprimirTicket(element.id, cantidad, responsable).subscribe({
        next: () => {
          this.mostrarSnack(`Ticket enviado (${cantidad} copias)`, 'success');
        },
        error: (err) => {
          console.error(err);
          // Si es un error 404 de endpoint, avisamos que quizás no está configurada la impresora
          const msg = err.message?.includes('404') ? 'Servicio de impresión no disponible' : 'Error al imprimir ticket';
          this.mostrarSnack(msg, 'error');
        }
      });
  }

  private mostrarSnack(mensaje: string, tipo: 'success' | 'error' = 'success') {
      this.snackBar.open(mensaje, 'Cerrar', {
          duration: 3000,
          panelClass: tipo === 'error' ? 'snackbar-error' : 'snackbar-success'
      });
  }

  // ==========================================================================
  // LÓGICA DE ELIMINACIÓN
  // ==========================================================================

  eliminarFila(element: DetalleCaptura): void {
    if (this.esPendiente(element)) {
      this.dialog.open(ConfirmationDialogModalComponent, {
          data: {
              type: 'info',
              title: 'Ítem Pendiente',
              message: 'Este ítem aún no se ha sincronizado con el servidor. Sincroniza antes de eliminar.',
              confirmText: 'Entendido'
          }
      });
      return;
    }

    if (element.id) {
      const dialogRef = this.dialog.open(ConfirmationDialogModalComponent, {
        data: {
          type: 'danger',
          title: 'Eliminar registro',
          message: `¿Estás seguro de eliminar "${element.articulo_nombre || 'este producto'}"? Esta acción es irreversible.`,
          confirmText: 'Sí, Eliminar'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.capturaService.eliminarDetalle(element.id).subscribe({
            next: () => this.mostrarSnack('Elemento eliminado', 'success'),
            error: (err) => {
              console.error(err);
              this.mostrarSnack('Error al eliminar', 'error');
            }
          });
        }
      });
    }
  }

  esPendiente(detalle: DetalleCaptura): boolean {
    return !detalle.id || !!detalle.pendiente_sync;
  }
}
