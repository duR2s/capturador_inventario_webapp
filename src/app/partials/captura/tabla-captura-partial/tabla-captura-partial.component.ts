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
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // <- USANDO MatDialog

// Componente del Diálogo (Manteniendo la ruta original del usuario)
import { TicketCapturaPartialsComponent } from 'src/app/partials/captura/ticket-captura-partials/ticket-captura-partials.component';


// Interfaz de la fila de la tabla
export interface CaptureRow {
  codigo: string;
  nombre: string;
  existencia_previa: number;
  existencia_capturada: number;
  diferencia: number;
}

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
      MatDialogModule, // <- USANDO MatDialogModule
    ],
  templateUrl: './tabla-captura-partial.component.html',
  styleUrls: ['./tabla-captura-partial.component.scss']
})
export class TablaCapturaPartialComponent implements AfterViewInit { // Agregamos implements AfterViewInit

  // ...dentro de tu clase de componente...
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  displayedColumns: string[] = ['codigo', 'nombre', 'existencia_previa', 'existencia_capturada', 'diferencia', 'editar', 'ticket', 'eliminar'];
  dataSource = new MatTableDataSource<CaptureRow>([
      { codigo: 'P001', nombre: 'Producto A', existencia_previa: 10, existencia_capturada: 0, diferencia: -10 },
      { codigo: 'P002', nombre: 'Producto B', existencia_previa: 5, existencia_capturada: 0, diferencia: -5 },
      { codigo: 'P003', nombre: 'Producto C', existencia_previa: 20, existencia_capturada: 15, diferencia: -5 },
      { codigo: 'P004', nombre: 'Producto D', existencia_previa: 1, existencia_capturada: 1, diferencia: 0 },
      { codigo: 'P005', nombre: 'Producto E', existencia_previa: 12, existencia_capturada: 15, diferencia: 3 },
      { codigo: 'P006', nombre: 'Producto F', existencia_previa: 8, existencia_capturada: 0, diferencia: -8 },
      { codigo: 'P007', nombre: 'Producto G', existencia_previa: 50, existencia_capturada: 45, diferencia: -5 },
      { codigo: 'P008', nombre: 'Producto H', existencia_previa: 15, existencia_capturada: 20, diferencia: 5 },
      { codigo: 'P009', nombre: 'Producto I', existencia_previa: 30, existencia_capturada: 30, diferencia: 0 },
      { codigo: 'P010', nombre: 'Producto J', existencia_previa: 2, existencia_capturada: 0, diferencia: -2 },
      { codigo: 'P011', nombre: 'Producto K', existencia_previa: 18, existencia_capturada: 18, diferencia: 0 },
      { codigo: 'P012', nombre: 'Producto L', existencia_previa: 7, existencia_capturada: 5, diferencia: -2 },
      { codigo: 'P013', nombre: 'Producto M', existencia_previa: 40, existencia_capturada: 42, diferencia: 2 },
      { codigo: 'P014', nombre: 'Producto N', existencia_previa: 3, existencia_capturada: 0, diferencia: -3 },
      { codigo: 'P015', nombre: 'Producto O', existencia_previa: 10, existencia_capturada: 12, diferencia: 2 },
    ]);

  // Utilizamos MatDialog inyectado
  private dialog = inject(MatDialog);

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  ticketProducto(element: CaptureRow): void {
    console.log(`Editando fila con código: ${element.codigo}`);
    this.dialog.open(TicketCapturaPartialsComponent, {
      data: { filaSeleccionada: element, generarTicket: true },
      width: '400px', // Opcional: añade un ancho para que el diálogo se vea bien
    }
    );
  }

  editarFila(element: CaptureRow): void {
    console.log(`Editando fila con código: ${element.codigo}`);
    this.dialog.open(TicketCapturaPartialsComponent, {
      data: { filaSeleccionada: element, generarTicket: false },
      width: '400px', // Opcional: añade un ancho para que el diálogo se vea bien
    }
    );
  }

  eliminarFila(element: CaptureRow): void {
    console.log(`Editando fila con código: ${element.codigo}`);
    // Implementación de eliminación...
  }
}
