import { Component, OnInit, Output, EventEmitter, Input, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

// Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services
import { CapturaService } from '../../../services/documents/captura.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-registro-captura',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './registro-captura.component.html',
  styleUrls: ['./registro-captura.component.scss']
})
export class RegistroCapturaComponent implements OnInit, OnChanges {

  @Output() onSesionCreada = new EventEmitter<any>();

  // Inputs para recibir datos del padre (Smart/Dumb component pattern)
  @Input() almacenes: any[] = [];
  @Input() usuarios: any[] = [];
  @Input() estados: any[] = [];

  @Input() capturaEdicion: any | null = null;

  form: FormGroup;
  isLoading: boolean = false;
  isLoadingCatalogos: boolean = false;
  errorMessage: string = '';

  public isAdmin: boolean = false;
  public isEditMode: boolean = false;

  public router = inject(Router);
  private facadeService = inject(FacadeService);

  constructor(
    private fb: FormBuilder,
    private capturaService: CapturaService
  ) {
    const rol = this.facadeService.getUserGroup();
    this.isAdmin = (rol === 'ADMIN');

    this.form = this.fb.group({
      // Folio ya no es required en el front para crear, el back lo ignora/genera
      folio: ['', []],
      almacen: ['', [Validators.required]],
      capturador: ['', [Validators.required]],
      estado: [{ value: 'BORRADOR', disabled: true }, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.verificarDatos();

    if (!this.capturaEdicion) {
      this.inicializarModoCreacion();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['capturaEdicion']) {
      if (this.capturaEdicion) {
        this.configurarModoEdicion(this.capturaEdicion);
      } else {
        if (!this.form.dirty) {
           this.inicializarModoCreacion();
        }
      }
    }
  }

  private verificarDatos() {
    if (this.almacenes.length === 0 || this.usuarios.length === 0 || this.estados.length === 0) {
      this.cargarDatosDesdeServicio();
    }
  }

  cargarDatosDesdeServicio() {
    this.isLoadingCatalogos = true;
    this.capturaService.cargarCatalogosIniciales().subscribe({
      next: (data) => {
        if (this.almacenes.length === 0) this.almacenes = data.almacenes;
        if (this.usuarios.length === 0) this.usuarios = data.capturadores;
        if (this.estados.length === 0) this.estados = data.estados;

        this.isLoadingCatalogos = false;
      },
      error: (err) => {
        console.error("Error cargando catálogos en hijo", err);
        this.isLoadingCatalogos = false;
      }
    });
  }

  private inicializarModoCreacion() {
    this.isEditMode = false;

    // CAMBIO: Ya no generamos el folio aquí.
    // Dejamos el campo vacío y deshabilitado.
    this.form.reset({
      folio: '', // El back lo generará
      almacen: '',
      capturador: '',
      estado: 'BORRADOR'
    });

    // Deshabilitamos el folio porque el usuario no debe tocarlo en creación
    this.form.get('folio')?.disable();
    this.form.get('estado')?.disable();
  }

  private configurarModoEdicion(data: any) {
    this.isEditMode = true;

    this.form.patchValue({
      folio: data.folio,
      almacen: data.almacen,
      capturador: data.capturador,
      estado: data.estado
    });

    // En edición sí mostramos el folio (que vendrá en data), pero sigue disabled o readonly si prefieres
    // Generalmente el folio no se edita nunca.
    this.form.get('folio')?.disable();

    if (this.isAdmin) {
      this.form.get('estado')?.enable();
    } else {
      this.form.get('estado')?.disable();
    }
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValues = this.form.getRawValue();

    if (this.isEditMode && this.capturaEdicion) {
      const payload = {
        // En edición, el folio no debería cambiar, pero lo mandamos por consistencia (o se ignora en back)
        folio: formValues.folio,
        almacen: formValues.almacen,
        capturador: formValues.capturador,
        estado: formValues.estado
      };

      this.capturaService.actualizarCaptura(this.capturaEdicion.id, payload).subscribe({
        next: (capturaActualizada) => {
          this.isLoading = false;
          this.onSesionCreada.emit(capturaActualizada);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Error al actualizar';
        }
      });
    } else {
      // --- MODO CREACIÓN ---
      // Enviamos el folio vacío. El back detectará esto y generará uno nuevo.
      this.capturaService.iniciarCaptura('', formValues.capturador, formValues.almacen).subscribe({
        next: (captura) => {
          this.isLoading = false;
          this.router.navigate(['/home/captura/form', captura.id]);
          this.onSesionCreada.emit(captura);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Error al crear';
        }
      });
    }
  }

  cancelar() {
    this.onSesionCreada.emit(null);
  }
}
