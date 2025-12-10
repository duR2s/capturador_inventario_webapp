import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Componente Padre (Asegúrate que la ruta de importación sea correcta)
import { DetalleCaptura } from '../../../captura.interfaces';

// --------------------------------------------------------------------------
// 1. Interfaz de Datos que esperamos recibir (antes del decorador)
// --------------------------------------------------------------------------
interface DialogData {
  filaSeleccionada: DetalleCaptura;
  generarTicket: boolean;
}

@Component({
  selector: 'app-ticket-captura-partials',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
],
  templateUrl: './ticket-captura-partials.component.html',
  styleUrls: ['./ticket-captura-partials.component.scss']
})
// --------------------------------------------------------------------------
// 2. La declaración de la clase DEBE seguir inmediatamente al decorador
// --------------------------------------------------------------------------
export class TicketCapturaPartialsComponent { // Se eliminó 'implements OnInit'

  // Propiedad para almacenar los datos de la fila seleccionada
  public datosFila: DetalleCaptura;
  // Form
  form: FormGroup;

  constructor(
    // 1. Inyección de FormBuilder (Para el formulario)
    private fb: FormBuilder,

    // 2. Inyección de la Referencia del Diálogo (Para cerrar)
    public dialogRef: MatDialogRef<TicketCapturaPartialsComponent>,

    // 3. Inyección de los Datos de Entrada (Para precargar el formulario)
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {

    // Inicializamos la propiedad para usarla fácilmente en el componente
    // Esta línea funcionará ahora que el padre envía la clave correcta 'filaSeleccionada'
    this.datosFila = data.filaSeleccionada;

    // Inicialización del FormGroup, ahora usando los datos recibidos
    this.form = this.fb.group({
      // Precarga el 'código' y lo hace requerido
      codigo: [this.datosFila.producto_codigo, Validators.required],

      // Precarga el 'nombre'
      nombre: [this.datosFila.nombre_articulo],

      // El campo 'cantidad' inicia con el valor capturado previamente o 0
      cantidad: [this.datosFila.cantidad_contada || 0, [Validators.required, Validators.min(0)]]
    });

    // Deshabilitar campos que no deben ser editados

    if (data.generarTicket) {
    this.form.get('codigo')?.disable();
    this.form.get('nombre')?.disable();
    }
  }

  // Se eliminó la función ngOnInit() con el throw new Error

  // --- MÉTODOS DE DIÁLOGO ---

  onClose(): void {
    // Cierra el diálogo sin devolver datos, útil para el botón de cancelar
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Obtén el valor completo del formulario, incluyendo los campos deshabilitados (código, nombre)
      const formValue = this.form.getRawValue();

      // Cierra el diálogo y devuelve el objeto con la nueva cantidad capturada.
      this.dialogRef.close(formValue);
    }
  }
}
