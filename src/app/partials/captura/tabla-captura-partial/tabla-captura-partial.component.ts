import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';


import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {ViewChild, AfterViewInit} from '@angular/core';


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
      MatPaginatorModule
    ],
  templateUrl: './tabla-captura-partial.component.html',
  styleUrls: ['./tabla-captura-partial.component.scss']
})
export class TablaCapturaPartialComponent {

// ...dentro de tu clase de componente...
@ViewChild(MatPaginator) paginator!: MatPaginator;

ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
}

  displayedColumns: string[] = ['codigo', 'nombre', 'existencia_previa', 'existencia_capturada', 'diferencia'];
    dataSource = new MatTableDataSource<CaptureRow>([
      { codigo: 'P001', nombre: 'Producto A', existencia_previa: 10, existencia_capturada: 0, diferencia: -10 },
      { codigo: 'P002', nombre: 'Producto B', existencia_previa: 5, existencia_capturada: 0, diferencia: -5 },
      { codigo: 'P001', nombre: 'Producto A', existencia_previa: 10, existencia_capturada: 0, diferencia: -10 },
      { codigo: 'P002', nombre: 'Producto B', existencia_previa: 5, existencia_capturada: 0, diferencia: -5 },
      { codigo: 'P001', nombre: 'Producto A', existencia_previa: 10, existencia_capturada: 0, diferencia: -10 },
      { codigo: 'P002', nombre: 'Producto B', existencia_previa: 5, existencia_capturada: 0, diferencia: -5 },
      { codigo: 'P001', nombre: 'Producto A', existencia_previa: 10, existencia_capturada: 0, diferencia: -10 },
      { codigo: 'P002', nombre: 'Producto B', existencia_previa: 5, existencia_capturada: 0, diferencia: -5 },
      { codigo: 'P001', nombre: 'Producto A', existencia_previa: 10, existencia_capturada: 0, diferencia: -10 },
      { codigo: 'P002', nombre: 'Producto B', existencia_previa: 5, existencia_capturada: 0, diferencia: -5 },
      { codigo: 'P001', nombre: 'Producto A', existencia_previa: 10, existencia_capturada: 0, diferencia: -10 },
      { codigo: 'P002', nombre: 'Producto B', existencia_previa: 5, existencia_capturada: 0, diferencia: -5 },
      { codigo: 'P001', nombre: 'Producto A', existencia_previa: 10, existencia_capturada: 0, diferencia: -10 },
      { codigo: 'P002', nombre: 'Producto B', existencia_previa: 5, existencia_capturada: 0, diferencia: -5 },
      { codigo: 'P001', nombre: 'Producto A', existencia_previa: 10, existencia_capturada: 0, diferencia: -10 },
      { codigo: 'P002', nombre: 'Producto B', existencia_previa: 5, existencia_capturada: 0, diferencia: -5 },
      { codigo: 'P001', nombre: 'Producto A', existencia_previa: 10, existencia_capturada: 0, diferencia: -10 },
      { codigo: 'P002', nombre: 'Producto B', existencia_previa: 5, existencia_capturada: 0, diferencia: -5 }
    ]);
}
