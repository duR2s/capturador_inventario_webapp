import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  // RouterOutlet es para el contenido dinámico, RouterLink para la navegación
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent {
  // Aquí puedes añadir lógica para el layout, como mostrar/ocultar el menú lateral
}
