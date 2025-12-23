import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; // Importar
import { MatTooltipModule } from '@angular/material/tooltip'; // Importar
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Componentes Hijos
import { BotonRegistroUsuariosComponent, TipoAccionUsuario } from '../../modals/usuarios/boton-registro-usuarios/boton-registro-usuarios.component';
import { TablaUsuariosComponent } from '../../partials/usuarios/tabla-usuarios/tabla-usuarios.component';
import { ConfirmationDialogModalComponent } from '../../modals/utilities/confirmation-dialog-modal/confirmation-dialog-modal.component';

// Componentes de Registro (Formularios)
import { RegistroAdminComponent } from '../../partials/usuarios/registro-administradores/registro-administradores.component';
import { RegistroEmpleadosComponent } from '../../partials/usuarios/registro-empleados/registro-empleados.component';

// Servicios
import { UsuariosService } from '../../services/roles/usuarios.service';

@Component({
  selector: 'app-usuarios-screen',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,   // Agregado
    MatTooltipModule,  // Agregado
    MatDialogModule,
    MatProgressSpinnerModule,
    BotonRegistroUsuariosComponent,
    TablaUsuariosComponent,
    RegistroAdminComponent,
    RegistroEmpleadosComponent
  ],
  templateUrl: './usuarios-screen.component.html',
  styleUrls: ['./usuarios-screen.component.scss']
})
export class UsuariosScreenComponent implements OnInit {

  // Inyecciones
  private usuariosService = inject(UsuariosService);
  private dialog = inject(MatDialog);

  // Estado de Datos
  public listaUsuarios: any[] = [];
  public isLoading: boolean = true;

  // Estado de la Vista (Orquestación)
  public showForm: boolean = false;
  public formRole: 'ADMIN' | 'EMPLEADO' = 'EMPLEADO';
  public userToEdit: any = null; // Si es null, es modo registro

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.isLoading = true;
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.listaUsuarios = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error cargando usuarios:", err);
        this.isLoading = false;
      }
    });
  }

  // --- Navegación Interna (Lógica de Botones y Tabla) ---

  // Se ejecuta al dar click en las Cards de "Registrar X"
  abrirRegistro(tipo: TipoAccionUsuario) {
    this.userToEdit = null; // Modo Registro
    this.formRole = tipo;
    this.showForm = true;
  }

  // Se ejecuta al dar click en el botón "Editar" de la tabla
  abrirEdicion(usuario: any) {
    this.userToEdit = usuario; // Modo Edición
    // Determinamos qué formulario mostrar según el puesto
    if (usuario.puesto === 'ADMIN') {
      this.formRole = 'ADMIN';
    } else {
      this.formRole = 'EMPLEADO';
    }
    this.showForm = true;
  }

  // Se ejecuta cuando el formulario emite "onClose"
  cerrarFormulario(seGuardoCambio: boolean) {
    this.showForm = false;
    this.userToEdit = null;

    if (seGuardoCambio) {
      // Si hubo cambios, recargamos la tabla
      this.cargarUsuarios();
    }
  }

  // --- Manejo de Eventos de la Tabla ---

  handleDelete(usuario: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogModalComponent, {
      data: {
        type: 'danger',
        title: 'Baja de Usuario',
        message: `¿Estás seguro de desactivar al usuario "${usuario.user.first_name} ${usuario.user.last_name}"? Ya no podrá acceder al sistema.`,
        confirmText: 'Sí, Desactivar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.usuariosService.eliminarUsuario(usuario.id).subscribe({
          next: () => {
            this.cargarUsuarios();
          },
          error: (err) => {
            console.error(err);
            this.isLoading = false;
            alert("Error al eliminar usuario.");
          }
        });
      }
    });
  }

  handleChangeRole(usuario: any) {
    console.log("Solicitud de cambio de rol para:", usuario.id);
    alert(`Funcionalidad de cambio de permisos para ${usuario.user.username} próximamente.`);
  }
}
