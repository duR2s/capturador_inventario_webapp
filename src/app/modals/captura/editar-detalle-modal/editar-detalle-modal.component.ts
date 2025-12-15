import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type EditModalMode = 'edit' | 'ticket';

export interface EditModalData {
  mode: EditModalMode;
  item: {
    codigo?: string;
    nombre?: string;
    cantidad?: number;
    imagen?: string;
    responsable?: string; // Solo para ticket
  };
}

@Component({
  selector: 'app-editar-detalle-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './editar-detalle-modal.component.html',
  styleUrls: ['./editar-detalle-modal.component.scss']
})
export class EditarDetalleModalComponent implements OnInit {

  form: FormGroup;
  imageLoaded: boolean = false;
  defaultTitle: string = 'Editar Detalle';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditarDetalleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditModalData
  ) {
    // Inicializamos el formulario vacío, se configura en ngOnInit
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.configureModal();
  }

  private configureModal() {
    const item = this.data.item || {};

    if (this.data.mode === 'edit') {
      this.defaultTitle = 'Editar Producto';
      // MODO EDICIÓN: Código editable, Nombre readonly, Cantidad editable
      this.form = this.fb.group({
        codigo: [item.codigo || '', [Validators.required]],
        nombre: [{ value: item.nombre || '', disabled: true }], // Readonly visual
        cantidad: [item.cantidad || 0, [Validators.required, Validators.min(0)]]
      });
    } else {
      this.defaultTitle = 'Generar Ticket';
      // MODO TICKET: Código/Nombre fijos, Cantidad inicia en 1, Responsable obligatorio
      this.form = this.fb.group({
        codigo: [{ value: item.codigo || '', disabled: true }],
        nombre: [{ value: item.nombre || '', disabled: true }],
        cantidad: [1, [Validators.required, Validators.min(1)]],
        responsable: ['', [Validators.required, Validators.minLength(3)]]
      });
    }

    // Listener para actualizar nombre si cambia el código (Simulación visual)
    // Nota: La lógica real de búsqueda la hace el padre, aquí solo permitimos la edición.
    // Si quisieras limpiar el nombre al cambiar código:
    /*
    this.form.get('codigo')?.valueChanges.subscribe(val => {
       if(this.data.mode === 'edit' && val !== item.codigo) {
          this.form.get('nombre')?.setValue('Calculando...');
       }
    });
    */
  }

  close() {
    this.dialogRef.close(null);
  }

  confirm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Devolvemos los datos del formulario (getRawValue para incluir disabled fields si fuera necesario,
    // o solo value para los editables).
    this.dialogRef.close(this.form.getRawValue());
  }

  // Helper para mostrar imagen
  onImageLoad() {
    this.imageLoaded = true;
  }
}
