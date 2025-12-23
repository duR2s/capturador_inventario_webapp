import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  // Nuevo: Emitimos el evento en lugar de navegar internamente
  @Output() onClick = new EventEmitter<TipoAccionUsuario>();

  get config() {
    if (this.tipo === 'ADMIN') {
      return {
        title: 'Registrar Administrador',
        desc: 'Crear usuario con acceso total al sistema',
        icon: 'admin_panel_settings',
        cssClass: 'style-admin'
      };
    } else {
      return {
        title: 'Registrar Empleado',
        desc: 'Crear capturador u operativo',
        icon: 'person_add',
        cssClass: 'style-empleado'
      };
    }
  }

  navegar() {
    // Emitimos el tipo de acción al padre (UsuariosScreen)
    this.onClick.emit(this.tipo);
  }
}
