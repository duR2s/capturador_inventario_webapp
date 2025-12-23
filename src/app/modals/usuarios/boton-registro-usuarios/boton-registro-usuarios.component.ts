import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

export type TipoAccionUsuario = 'ADMIN' | 'EMPLEADO';

@Component({
  selector: 'app-boton-registro-usuarios',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatRippleModule],
  templateUrl: './boton-registro-usuarios.component.html',
  styleUrls: ['./boton-registro-usuarios.component.scss']
})
export class BotonRegistroUsuariosComponent {

  @Input() tipo: TipoAccionUsuario = 'EMPLEADO'; // Default

  private router = inject(Router);

  get config() {
    if (this.tipo === 'ADMIN') {
      return {
        title: 'Registrar Administrador',
        desc: 'Crear usuario con acceso total al sistema',
        icon: 'admin_panel_settings',
        cssClass: 'style-admin',
        route: '/administrador/registro' // Ajusta a tu ruta real
      };
    } else {
      return {
        title: 'Registrar Empleado',
        desc: 'Crear capturador u operativo',
        icon: 'person_add', // O 'badge'
        cssClass: 'style-empleado',
        route: '/empleados/registro' // Ajusta a tu ruta real
      };
    }
  }

  navegar() {
    this.router.navigate([this.config.route]);
  }
}
