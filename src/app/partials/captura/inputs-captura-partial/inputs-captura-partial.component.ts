import { CapturaService } from './../../../services/documents/captura.service';
import { Component, ElementRef, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

// Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// RxJS
import { finalize } from 'rxjs';

// Services
import { DetalleCapturaService } from '../../../services/documents/detalle-captura.service'; // Ajusta ruta si es necesario

@Component({
  selector: 'app-inputs-captura-partial',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './inputs-captura-partial.component.html',
  styleUrls: ['./inputs-captura-partial.component.scss']
})
export class InputsCapturaPartialComponent implements OnInit {

  @ViewChild('cantidadInput') cantidadInput!: ElementRef<HTMLInputElement>;
  @ViewChild('codigoInput') codigoInput!: ElementRef<HTMLInputElement>;

  form: FormGroup;
  isLoading = false;
  isMobileImageExpanded = false;
  currentImageUrl: string | null = null;
  errorMessage: string = '';

  // Nueva bandera para controlar la visibilidad del botón
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private detalleCapturaService: DetalleCapturaService,
    @Optional() public dialogRef: MatDialogRef<InputsCapturaPartialComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      codigo: ['', [Validators.required]],
      nombre: [{ value: '', disabled: true }],
      cantidad: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
    });
  }

  ngOnInit(): void {
    // Detectar si es modo edición basándonos en si llega data (un ID o un folio)
    if (this.data && (this.data.id || this.data.codigo)) {
      this.isEditMode = true;
      this.form.patchValue(this.data);
      if(this.data.imagen) this.currentImageUrl = this.data.imagen;
    } else {
      this.isEditMode = false;
    }

    // Listener para limpiar UI si borran código manualmente
    this.form.get('codigo')?.valueChanges.subscribe((val) => {
      if (!this.isLoading && (!val || val.length === 0)) {
        this.resetUIFields();
      }
    });
  }

  // --- LÓGICA DE FLUJO ---

  onCodigoEnter(): void {
    const codigoVal = this.form.get('codigo')?.value;
    if (!codigoVal) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Bloquear input código temporalmente
    this.form.get('codigo')?.disable({ emitEvent: false });

    // Foco inmediato a cantidad (Optimistic UI)
    setTimeout(() => {
      this.cantidadInput.nativeElement.focus();
      this.cantidadInput.nativeElement.select();
    }, 50);

    // Buscar en backend
    this.detalleCapturaService.buscarArticulo(codigoVal)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.form.get('codigo')?.enable({ emitEvent: false });
        })
      )
      .subscribe({
        next: (response: any) => {
          const articulo = Array.isArray(response) ? response[0] : response;

          if (articulo) {
            this.form.patchValue({ nombre: articulo.nombre });
            this.currentImageUrl = articulo.imagen_url || null;
          } else {
            this.handleErrorProductoNoEncontrado();
          }
        },
        error: (err) => {
          console.error("Error buscando artículo", err);
          this.handleErrorProductoNoEncontrado();
        }
      });
  }

  // Evento disparado al dar ENTER en el campo Cantidad
  onCantidadEnter(): void {
    if (this.form.valid) {
      this.guardar();
    } else {
      // Si dan enter y no es válido (ej. vacío), forzamos validación visual
      this.form.markAllAsTouched();
    }
  }

  guardar() {
    // Validaciones extra del servicio
    const errors = this.detalleCapturaService.validarCaptura(this.form.getRawValue());
    if (Object.keys(errors).length > 0) {
      console.log("Errores de validación:", errors);
      return;
    }

    if (this.form.invalid) return;

    this.isLoading = true;
    const dataCaptura = this.form.getRawValue();

    // Guardar en Backend
    this.detalleCapturaService.registrarConteo(dataCaptura)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          console.log('Captura guardada:', res);
          this.postGuardadoExitoso();
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          this.errorMessage = 'Error al guardar. Intente de nuevo.';
        }
      });
  }

  // --- UTILIDADES ---

  private resetUIFields() {
    this.form.patchValue({ nombre: '', cantidad: '' }, { emitEvent: false });
    this.currentImageUrl = null;
    this.errorMessage = '';
  }

  private handleErrorProductoNoEncontrado() {
    this.form.patchValue({ nombre: 'PRODUCTO NO ENCONTRADO' });
    this.errorMessage = 'Código no válido.';
    this.cantidadInput.nativeElement.blur();

    // Regresar foco al código para corregir
    setTimeout(() => {
        const inputCodigo = document.querySelector('input[formControlName="codigo"]') as HTMLInputElement;
        inputCodigo?.focus();
        inputCodigo?.select();
    }, 100);
  }

  private postGuardadoExitoso() {
    if (this.isEditMode && this.dialogRef) {
      // Si estamos editando, cerramos el modal al terminar
      this.dialogRef.close(true);
    } else {
      // Flujo continuo de captura rápida
      this.resetUIFields();
      this.form.get('codigo')?.setValue('');

      // Enfocar código para el siguiente producto inmediatamente
      setTimeout(() => {
        const inputCodigo = document.querySelector('input[formControlName="codigo"]') as HTMLInputElement;
        inputCodigo?.focus();
      }, 50); // Un pequeño delay ayuda a la UI a refrescarse
    }
  }

  abrirBusqueda() {
    console.log("Abrir modal de búsqueda avanzada...");
  }

  toggleMobileImage() {
    this.isMobileImageExpanded = !this.isMobileImageExpanded;
  }

  cerrar() {
    if (this.dialogRef) this.dialogRef.close();
  }
}
