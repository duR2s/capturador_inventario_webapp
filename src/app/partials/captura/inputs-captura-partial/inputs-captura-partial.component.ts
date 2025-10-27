import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-inputs-captura-partial',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatCardModule,
      MatIconModule
    ],
  templateUrl: './inputs-captura-partial.component.html',
  styleUrls: ['./inputs-captura-partial.component.scss']
})
export class InputsCapturaPartialComponent {
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
  }

  // Registrar la captura: actualizar existencia_capturada y diferencia
  registrarCaptura(): void {

  }

  private recalculateDifferences(): void {
  }
}
