import { Component, ElementRef, Inject, OnInit, Optional, ViewChild, Output, EventEmitter, Input } from '@angular/core';
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
export class InputsCapturaPartialComponent implements OnInit {

  // --- INPUTS & OUTPUTS (Comunicación con Padre) ---
  @Input() isLoading: boolean = false;
  @Output() onEscanear = new EventEmitter<{ codigo: string, cantidad: number }>();

  // --- VIEW CHILDS ---
  @ViewChild('cantidadInput') cantidadInput!: ElementRef<HTMLInputElement>;
  @ViewChild('codigoInput') codigoInput!: ElementRef<HTMLInputElement>;

  // --- ESTADO INTERNO ---
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
      nombre: [{ value: '', disabled: true }], // Campo solo lectura para feedback visual
      cantidad: [1, [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    // Detectar si es modo edición basándonos en si llega data
    if (this.data && (this.data.id || this.data.codigo)) {
      this.isEditMode = true;
      this.form.patchValue(this.data);
      if (this.data.imagen) this.currentImageUrl = this.data.imagen;
    }

    // Listener para limpiar UI si borran código manualmente
    this.form.get('codigo')?.valueChanges.subscribe((val) => {
      if (!this.isLoading && (!val || val.length === 0)) {
        this.resetUIFields();
      }
    });

    // Foco inicial
    setTimeout(() => this.focarInputCodigo(), 500);
  }

  // --- LÓGICA DE FLUJO ---

  /**
   * Se dispara al dar ENTER en el input de Código.
   * En flujo masivo, esto podría pasar el foco a cantidad o enviar directo.
   * Aquí mantenemos tu flujo de "Pasar a Cantidad".
   */
  onCodigoEnter(): void {
    const codigoVal = this.form.get('codigo')?.value;
    if (!codigoVal) return;

    this.errorMessage = '';

    // Optimistic UI: Asumimos éxito y pasamos foco a cantidad
    setTimeout(() => {
      if (this.cantidadInput) {
        this.cantidadInput.nativeElement.focus();
        this.cantidadInput.nativeElement.select();
      }
    }, 50);

    // NOTA: Si necesitas buscar la info del producto (nombre/foto) ANTES de confirmar cantidad,
    // el padre debería proveer esa info o un método de búsqueda.
    // Por simplicidad y rendimiento en PWA, asumimos flujo rápido.
  }

  /**
   * Se dispara al dar ENTER en Cantidad o clic en Guardar.
   */
  onCantidadEnter(): void {
    if (this.form.valid && !this.isLoading) {
      this.guardar();
    } else {
      this.form.markAllAsTouched();
    }
  }

  guardar() {
    const { codigo, cantidad } = this.form.getRawValue();

    // EMITIR EVENTO AL PADRE (Quien tiene la lógica Online/Offline)
    this.onEscanear.emit({
      codigo: codigo.trim(),
      cantidad: Number(cantidad)
    });
    // Acciones Post-Envío (UI)
    this.postGuardadoExitoso();
  }

  // --- UI HELPERS & VISUALS (Tu código original preservado) ---

  private resetUIFields() {
    this.form.patchValue({ nombre: '', cantidad: 1 }, { emitEvent: false });
    this.currentImageUrl = null;
    this.errorMessage = '';
  }

  private postGuardadoExitoso() {
    if (this.isEditMode && this.dialogRef) {
      this.dialogRef.close(true);
    } else {
      // Flujo continuo
      this.resetUIFields();
      this.form.get('codigo')?.setValue('');
      this.focarInputCodigo();
    }
  }

  private focarInputCodigo() {
    setTimeout(() => {
      if (this.codigoInput) {
        this.codigoInput.nativeElement.focus();
      }
    }, 50);
  }

  toggleMobileImage() {
    this.isMobileImageExpanded = !this.isMobileImageExpanded;
  }

  abrirBusqueda() {
    // Aquí podrías emitir otro evento al padre si quieres manejar la búsqueda global
    console.log("Abrir modal de búsqueda...");
  }

  cerrar() {
    if (this.dialogRef) this.dialogRef.close();
  }
}
