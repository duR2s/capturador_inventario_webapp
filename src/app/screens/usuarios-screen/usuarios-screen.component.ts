import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Componentes Hijos (Asegúrate de que las rutas sean correctas)
import { BotonRegistroUsuariosComponent } from '../../modals/usuarios/boton-registro-usuarios/boton-registro-usuarios.component';
import { TablaUsuariosComponent } from '../../partials/usuarios/tabla-usuarios/tabla-usuarios.component';
import { ConfirmationDialogModalComponent } from '../../modals/utilities/confirmation-dialog-modal/confirmation-dialog-modal.component';

// Servicios
import { UsuariosService } from '../../services/roles/usuarios.service';

@Component({
  selector: 'app-usuarios-screen',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    BotonRegistroUsuariosComponent, // Tus cards de registro
    TablaUsuariosComponent    // Tu tabla unificada
  ],
  templateUrl: './usuarios-screen.component.html',
  styleUrls: ['./usuarios-screen.component.scss']
})
export class UsuariosScreenComponent implements OnInit {

  // Inyecciones
  private usuariosService = inject(UsuariosService);
  private dialog = inject(MatDialog);

  // Estado
  public listaUsuarios: any[] = [];
  public isLoading: boolean = true;

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.isLoading = true;
    // Llamamos al servicio unificado sin filtros para traer a todos (Admins + Empleados)
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
            // Recargamos la lista tras eliminar
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
    // Aquí implementarás la lógica para abrir un modal de cambio de permisos en el futuro
    console.log("Solicitud de cambio de rol para:", usuario.id);
    alert(`Funcionalidad de cambio de permisos para ${usuario.user.username} próximamente.`);
  }
}
