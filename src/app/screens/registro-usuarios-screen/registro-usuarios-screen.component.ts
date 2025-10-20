import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importa los nuevos componentes "parciales" que usarás
import { RegistroAdministradoresComponent } from '../../partials/registro/registro-administradores/registro-administradores.component';
import { RegistroCapturadorComponent } from '../../partials/registro/registro-capturador/registro-capturador.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro-usuarios-screen',
  standalone: true,
  // Importa los componentes que vas a usar en la plantilla.
  imports: [
    CommonModule,
    RouterLink,
    RegistroAdministradoresComponent,
    RegistroCapturadorComponent
  ],
  templateUrl: './registro-usuarios-screen.component.html',
  styleUrls: ['./registro-usuarios-screen.component.scss']
})
export class RegistroUsuariosScreenComponent {
  // Variable para controlar qué formulario se muestra (con los nuevos tipos)
  tipoRegistro: 'administrador' | 'capturador' | null = 'capturador';
}

