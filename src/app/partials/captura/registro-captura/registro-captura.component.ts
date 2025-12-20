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

  @Input() almacenes: any[] = [];
  @Input() usuarios: any[] = [];

  // NUEVO: Input para recibir datos a editar
  @Input() capturaEdicion: any | null = null;

  form: FormGroup;
  isLoading: boolean = false;
  isLoadingCatalogos: boolean = false;
  errorMessage: string = '';

  public isAdmin: boolean = false;
  public isEditMode: boolean = false;

  // Estados disponibles (Hardcoded por ahora como solicitaste)
  public estadosDisponibles = [
    { value: 'BORRADOR', label: 'Borrador (Editable)' },
    { value: 'CONFIRMADO', label: 'Confirmado (Cerrado Local)' },
    { value: 'PROCESADO', label: 'Procesado (Sincronizado)' }
  ];

  public router = inject(Router);
  private facadeService = inject(FacadeService);

  constructor(
    private fb: FormBuilder,
    private capturaService: CapturaService
  ) {
    this.form = this.fb.group({
      folio: ['', [Validators.required]],
      almacen: ['', [Validators.required]],
      capturador: ['', [Validators.required]],
      // NUEVO: Campo Estado (inicialmente deshabilitado para create)
      estado: [{ value: 'BORRADOR', disabled: true }, [Validators.required]]
    });
  }

  ngOnInit(): void {
    // 1. Verificar si es ADMIN
    const rol = this.facadeService.getUserGroup();
    this.isAdmin = (rol === 'ADMIN');

    // 2. Cargar catálogos si faltan
    if (this.almacenes.length === 0 || this.usuarios.length === 0) {
      this.cargarDatos();
    }

    // 3. Inicializar modo creación si no hay edición
    if (!this.capturaEdicion) {
      this.inicializarModoCreacion();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['capturaEdicion']) {
      if (this.capturaEdicion) {
        this.configurarModoEdicion(this.capturaEdicion);
      } else {
        this.inicializarModoCreacion();
      }
    }
  }

  private inicializarModoCreacion() {
    this.isEditMode = false;
    const folioSugerido = `INV-${new Date().getFullYear()}${Math.floor(Math.random() * 10000)}`;

    this.form.reset({
      folio: folioSugerido,
      almacen: '',
      capturador: '',
      estado: 'BORRADOR'
    });

    // En creación, el estado siempre es borrador y está bloqueado
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

    // Si es ADMIN, habilitamos el select de estado
    if (this.isAdmin) {
      this.form.get('estado')?.enable();
    } else {
      this.form.get('estado')?.disable();
    }
  }

  cargarDatos() {
    this.isLoadingCatalogos = true;
    this.capturaService.cargarCatalogosIniciales().subscribe({
      next: (data) => {
        if (this.almacenes.length === 0) this.almacenes = data.almacenes;
        if (this.usuarios.length === 0) this.usuarios = data.capturadores;
        this.isLoadingCatalogos = false;
      },
      error: (err) => {
        console.error("Error cargando catálogos", err);
        this.errorMessage = "Error al conectar con el servidor para obtener listas.";
        this.isLoadingCatalogos = false;
      }
    });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Usamos getRawValue para incluir campos deshabilitados (como estado en modo create)
    const formValues = this.form.getRawValue();

    if (this.isEditMode && this.capturaEdicion) {
      // --- MODO EDICIÓN (PATCH) ---
      const payload = {
        folio: formValues.folio,
        almacen: formValues.almacen,
        capturador: formValues.capturador,
        estado: formValues.estado
      };

      this.capturaService.actualizarCaptura(this.capturaEdicion.id, payload).subscribe({
        next: (capturaActualizada) => {
          this.isLoading = false;
          // Emitimos evento de éxito (el padre recargará la lista o cerrará)
          this.onSesionCreada.emit(capturaActualizada);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Error al actualizar la sesión';
        }
      });

    } else {
      // --- MODO CREACIÓN (POST) ---
      this.capturaService.iniciarCaptura(formValues.folio, formValues.capturador, formValues.almacen).subscribe({
        next: (captura) => {
          this.isLoading = false;
          // Navegar directamente a la captura
          this.router.navigate(['/home/captura/form', captura.id]);
          this.onSesionCreada.emit(captura);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Error al crear la sesión';
        }
      });
    }
  }

  cancelar() {
    this.onSesionCreada.emit(null);
  }
}
