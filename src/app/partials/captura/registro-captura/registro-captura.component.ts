import { Component, OnInit, Output, EventEmitter, Input, inject } from '@angular/core';
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
import { AppRoutingModule } from "src/app/app-routing.module";

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
export class RegistroCapturaComponent implements OnInit {

  @Output() onSesionCreada = new EventEmitter<any>();

  // Ahora son opcionales, si no vienen, el componente los busca
  @Input() almacenes: any[] = [];
  @Input() usuarios: any[] = [];

  form: FormGroup;
  isLoading: boolean = false;
  isLoadingCatalogos: boolean = false; // Estado de carga para los selects
  errorMessage: string = '';

  public router = inject(Router);

  constructor(
    private fb: FormBuilder,
    private capturaService: CapturaService
  ) {
    this.form = this.fb.group({
      folio: ['', [Validators.required]],
      almacen: ['', [Validators.required]],
      capturador: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const folioSugerido = `INV-${new Date().getFullYear()}${Math.floor(Math.random() * 10000)}`;
    this.form.patchValue({ folio: folioSugerido });

    // Si los inputs vienen vacíos, cargamos los datos desde el servicio
    if (this.almacenes.length === 0 || this.usuarios.length === 0) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    this.isLoadingCatalogos = true;
    this.capturaService.cargarCatalogosIniciales().subscribe({
      next: (data) => {
        // Solo actualizamos si estaban vacíos
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

  crearSesion() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const { folio, capturador, almacen } = this.form.value;

    this.capturaService.iniciarCaptura(folio, capturador, almacen).subscribe({
      next: (captura) => {
        this.isLoading = false;
        console.log("Sesión creada:", captura);
        this.onSesionCreada.emit(captura);

        // CORRECCIÓN AQUÍ: Ruta absoluta incluyendo '/home'
        this.router.navigate(['/home/captura/form', captura.id]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Error al crear la sesión';
      }
    });
  }

  cancelar() {
    this.onSesionCreada.emit(null);
  }
}
