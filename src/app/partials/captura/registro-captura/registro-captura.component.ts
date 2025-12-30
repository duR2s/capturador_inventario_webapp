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

  @Output() onCancelar = new EventEmitter<void>();
  @Output() onSesionCreada = new EventEmitter<any>();

  // Inputs para llenar los Selects
  @Input() almacenes: any[] = [];
  @Input() usuarios: any[] = []; // Lista de capturadores disponibles
  @Input() estados: any[] = [];

  // Input opcional para modo edición
  @Input() capturaEdicion: any = null;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private capturaService = inject(CapturaService);
  private facadeService = inject(FacadeService);

  public form!: FormGroup;
  public isLoading: boolean = false;
  public isEditMode: boolean = false;
  public isAdmin: boolean = false;
  public errorMessage: string = '';

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.checkUserRole();
    this.aplicarFiltroCapturador(); // Intento inicial por si los datos ya están ahí
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detectamos si cambia la lista de usuarios (viene asíncrona del padre)
    if (changes['usuarios']) {
      this.checkUserRole(); // Aseguramos tener el rol actualizado
      this.aplicarFiltroCapturador();
    }

    if (changes['capturaEdicion'] && this.capturaEdicion) {
      this.isEditMode = true;
      // Llenar formulario
      this.form.patchValue({
        folio: this.capturaEdicion.folio,
        almacen: this.capturaEdicion.almacen, // ID del almacen
        capturador: this.capturaEdicion.capturador, // ID del usuario
        estado: this.capturaEdicion.estado
      });

      // Si estamos editando y no es admin, aseguramos que el campo siga bloqueado
      if (!this.isAdmin) {
        this.form.get('capturador')?.disable();
      }
    }
  }

  private initForm() {
    this.form = this.fb.group({
      folio: [''], // Solo visual o autogenerado
      almacen: ['', [Validators.required]],
      capturador: ['', [Validators.required]],
      estado: ['BORRADOR'] // Default para nuevos
    });
  }

  private checkUserRole() {
    const rol = this.facadeService.getUserGroup();
    this.isAdmin = (rol === 'ADMIN');
  }

  /**
   * Lógica Principal:
   * Si NO es admin, filtra la lista de usuarios para mostrar solo el propio
   * y lo selecciona automáticamente.
   */
  private aplicarFiltroCapturador() {
    // Solo actuamos si no es admin y ya tenemos lista de usuarios cargada
    if (!this.isAdmin && this.usuarios && this.usuarios.length > 0) {
      const userId = Number(this.facadeService.getUserId());

      if (userId) {
        // 1. Filtramos la lista visualmente para que solo aparezca él mismo
        const miUsuario = this.usuarios.find(u => u.user.id === userId);

        if (miUsuario) {
          this.usuarios = [miUsuario];
        }

        // 2. Pre-seleccionamos el valor en el form
        // Usamos emitEvent: false para no disparar validaciones innecesarias aún
        this.form.patchValue({ capturador: userId }, { emitEvent: false });

        // 3. Deshabilitamos el control para protegerlo
        this.form.get('capturador')?.disable();
      }
    }
  }

  cancelar() {
    this.onCancelar.emit();
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Usamos getRawValue() para obtener valores incluso de campos deshabilitados (como el capturador bloqueado)
    const formValues = this.form.getRawValue();

    if (this.isEditMode && this.capturaEdicion) {
      const payload = {
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
      this.capturaService.iniciarCaptura('', formValues.capturador, formValues.almacen).subscribe({
        next: (captura) => {
          this.isLoading = false;
          this.router.navigate(['/home/captura/form', captura.id]);
          this.onSesionCreada.emit(captura);
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this.errorMessage = 'No se pudo crear la sesión. Verifique conexión.';
        }
      });
    }
  }
}
