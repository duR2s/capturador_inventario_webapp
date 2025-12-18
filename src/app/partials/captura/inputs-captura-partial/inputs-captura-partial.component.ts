import { Component, ElementRef, Inject, OnInit, Optional, ViewChild, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

// Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
export class InputsCapturaPartialComponent implements OnInit, OnChanges {

  @Input() isLoading: boolean = false;
  // Recibimos el objeto completo, que ahora trae 'existencia_teorica' del back
  @Input() articuloEncontrado: any | null = null;

  @Output() onBuscarCodigo = new EventEmitter<string>();
  @Output() onConfirmarCaptura = new EventEmitter<{ codigo: string, cantidad: number }>();

  @ViewChild('codigoInput') codigoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cantidadInput') cantidadInput!: ElementRef<HTMLInputElement>;

  form: FormGroup;
  isEditMode: boolean = false;
  currentImageUrl: string | null = null;
  errorMessage: string = '';
  isMobileImageExpanded: boolean = false;

  constructor(
    private fb: FormBuilder,
    @Optional() public dialogRef: MatDialogRef<InputsCapturaPartialComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      nombre: [{ value: '', disabled: true }], // Campo solo visual
      cantidad: [1, [Validators.required, Validators.min(0.001)]]
    });

    // Si se abre como Modal (Edición)
    if (this.data && this.data.mode === 'edit') {
      this.isEditMode = true;
      this.currentImageUrl = this.data.item.imagen;
      this.form.patchValue({
        codigo: this.data.item.codigo,
        nombre: this.data.item.nombre,
        cantidad: this.data.item.cantidad
      });
      this.form.get('codigo')?.disable(); // En edición no cambiamos código
    }
  }

  ngOnInit(): void {
    // Foco inicial si no es edición
    if (!this.isEditMode) {
      this.focarInputCodigo();
    }
  }

  // --- NUEVA LÓGICA: DETECTAR ARTÍCULO ENCONTRADO ---
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['articuloEncontrado'] && this.articuloEncontrado) {

      // 1. Mostrar nombre para feedback visual
      this.form.patchValue({
        nombre: this.articuloEncontrado.nombre
      });

      // 2. Lógica de Existencia Previa
      // Si el backend envió existencia teórica, la usamos. Si no, por defecto 1.
      const existencia = this.articuloEncontrado.existencia_teorica;

      if (existencia !== undefined && existencia !== null) {
        // Pre-llenamos con la existencia actual para validarla/ajustarla
        this.form.patchValue({ cantidad: existencia });
      } else {
        this.form.patchValue({ cantidad: 1 });
      }

      this.errorMessage = ''; // Limpiar errores previos

      // 3. Mover foco a cantidad y seleccionar todo para facilitar sobreescritura
      setTimeout(() => {
        if (this.cantidadInput) {
          this.cantidadInput.nativeElement.focus();
          this.cantidadInput.nativeElement.select();
        }
      }, 100);
    }
  }

  toggleMobileImage() {
    this.isMobileImageExpanded = !this.isMobileImageExpanded;
  }

  cerrar() {
    this.dialogRef?.close();
  }

  onCodigoEnter() {
    const codigoVal = this.form.get('codigo')?.value;
    if (codigoVal) {
      this.errorMessage = '';
      this.onBuscarCodigo.emit(codigoVal);
    }
  }

  onCantidadEnter() {
    if (this.form.valid) {
      this.guardar();
    } else {
      this.form.markAllAsTouched();
    }
  }

  guardar() {
    // Obtenemos valores raw para incluir campos deshabilitados si fuera necesario
    const rawValues = this.form.getRawValue();

    // Si estamos en flujo normal (no modal), usamos el código buscado o el del input
    const codigoFinal = this.articuloEncontrado?.clave || rawValues.codigo;

    this.onConfirmarCaptura.emit({
      codigo: codigoFinal.trim(),
      cantidad: Number(rawValues.cantidad)
    });
  }

  abrirBusqueda() {
    this.errorMessage = '';
  }

  public limpiarFormulario() {
    this.form.reset({
        codigo: '',
        nombre: '',
        cantidad: 1
    });
    this.currentImageUrl = null;
    this.errorMessage = '';

    // Forzamos foco al código para el siguiente
    this.focarInputCodigo();
  }

  private focarInputCodigo() {
    setTimeout(() => {
      if (this.codigoInput && !this.codigoInput.nativeElement.disabled) {
        this.codigoInput.nativeElement.focus();
      }
    }, 200);
  }
}
