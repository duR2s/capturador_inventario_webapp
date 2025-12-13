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
  @Input() articuloEncontrado: any | null = null;

  @Output() onBuscarCodigo = new EventEmitter<string>();
  @Output() onConfirmarCaptura = new EventEmitter<{ codigo: string, cantidad: number }>();

  @ViewChild('cantidadInput') cantidadInput!: ElementRef<HTMLInputElement>;
  @ViewChild('codigoInput') codigoInput!: ElementRef<HTMLInputElement>;

  form: FormGroup;
  isMobileImageExpanded = false;
  currentImageUrl: string | null = null;
  errorMessage: string = '';
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    @Optional() public dialogRef: MatDialogRef<InputsCapturaPartialComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      codigo: ['', [Validators.required]],
      nombre: [{ value: '', disabled: true }],
      cantidad: [1, [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    if (this.data && (this.data.id || this.data.codigo)) {
      this.isEditMode = true;
      this.form.patchValue(this.data);
      if (this.data.imagen) this.currentImageUrl = this.data.imagen;
    }

    // Listener para limpiar si borran código manualmente
    this.form.get('codigo')?.valueChanges.subscribe((val) => {
      // Si el usuario borra todo el texto manualmente y NO estamos cargando
      if (!this.isLoading && (!val || val.length === 0)) {
         // Opcional: Si quieres reiniciar UI al borrar manual
         // this.resetUIFields();
      }
    });

    setTimeout(() => this.focarInputCodigo(), 500);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['articuloEncontrado'] && this.articuloEncontrado) {
      this.form.patchValue({ nombre: this.articuloEncontrado.nombre });

      setTimeout(() => {
        if (this.cantidadInput) {
          this.cantidadInput.nativeElement.focus();
          this.cantidadInput.nativeElement.select();
        }
      }, 100);
    }
  }

  onCodigoEnter(): void {
    const codigoVal = this.form.get('codigo')?.value;
    if (!codigoVal) {
      return;
    }
    this.errorMessage = '';
    this.onBuscarCodigo.emit(codigoVal.trim());
    this.codigoInput.nativeElement.select();
  }

  onCantidadEnter(): void {
    if (!this.form.invalid || !this.isLoading) {
      //this.guardar();
    }
  }


  guardar() {
    const { codigo, cantidad } = this.form.getRawValue();

    // 1. SOLO EMITIMOS. No limpiamos aquí. Esperamos al padre.
    this.onConfirmarCaptura.emit({
      codigo: codigo.trim(),
      cantidad: Number(cantidad)
    });
  }

  // El padre llamará a esto cuando el servidor responda "OK"
  public limpiarFormulario() {
    // 2. Usamos reset() en lugar de patchValue().
    // reset() limpia los valores Y quita los errores de validación (untouched/pristine).
    this.form.reset({
        codigo: '',
        nombre: '',
        cantidad: 1 // Valor por defecto para cantidad
    });

    // Restauramos el estado visual
    this.currentImageUrl = null;
    this.errorMessage = '';
    // 3. Forzamos el foco al código para el siguiente producto
    this.focarInputCodigo();
  }

  private focarInputCodigo() {
    // Pequeño delay para asegurar que el DOM se actualizó tras el reset
    setTimeout(() => {
      if (this.codigoInput) {
        this.codigoInput.nativeElement.focus();
      }
    }, 100);
  }

  toggleMobileImage() {
    this.isMobileImageExpanded = !this.isMobileImageExpanded;
  }

  abrirBusqueda() {
    console.log("Abrir modal de búsqueda...");
  }

  cerrar() {
    if (this.dialogRef) this.dialogRef.close();
  }
}
