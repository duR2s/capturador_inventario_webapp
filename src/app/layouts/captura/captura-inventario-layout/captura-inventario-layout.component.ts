import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface CaptureRow {
  codigo: string;
  nombre: string;
  existencia_previa: number;
  existencia_capturada: number;
  diferencia: number;
}

@Component({
  selector: 'app-captura-inventario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './captura-inventario-layout.component.html',
  styleUrls: ['./captura-inventario-layout.component.scss']
})
export class CapturaInventarioComponent {
  // Table
  displayedColumns: string[] = ['codigo', 'nombre', 'existencia_previa', 'existencia_capturada', 'diferencia'];
  dataSource: CaptureRow[] = [
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
  ];

  // Form
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      nombre: [''],
      cantidad: [null, [Validators.required, Validators.min(0)]]
    });
    this.recalculateDifferences();
  }

  // Buscar producto por código o nombre y rellenar el formulario si se encuentra
  buscarProducto(): void {
    const { codigo, nombre } = this.form.value;
    const found = this.dataSource.find(r => (codigo && r.codigo === codigo) || (nombre && r.nombre.toLowerCase() === nombre.toLowerCase()));
    if (found) {
      this.form.patchValue({ codigo: found.codigo, nombre: found.nombre });
    }
  }

  // Registrar la captura: actualizar existencia_capturada y diferencia
  registrarCaptura(): void {
    const { codigo, nombre, cantidad } = this.form.value;
    if (!codigo || cantidad == null) return;

    let row = this.dataSource.find(r => r.codigo === codigo);
    if (!row) {
      row = { codigo, nombre: nombre || 'Sin nombre', existencia_previa: 0, existencia_capturada: 0, diferencia: 0 };
      this.dataSource.unshift(row);
    }

    row.existencia_capturada = Number(cantidad);
    row.diferencia = row.existencia_capturada - row.existencia_previa;
    // reset cantidad field
    this.form.patchValue({ cantidad: null });
  }

  private recalculateDifferences(): void {
    this.dataSource = this.dataSource.map(r => ({ ...r, diferencia: r.existencia_capturada - r.existencia_previa }));
  }

}
