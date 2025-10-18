import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// --- app.component.ts ---
// Este es el componente principal. Ahora es muy simple.
// Su única responsabilidad es mostrar el componente que corresponda
// según la ruta activa.

@Component({
  selector: 'app-root',
  standalone: true,
  // Importamos RouterOutlet para que el sistema de rutas funcione.
  imports: [RouterOutlet],
  template: `
    <!--
      RouterOutlet es un marcador de posición.
      Angular inyectará aquí el componente correspondiente a la ruta actual.
      (Por ejemplo, AuthLayoutComponent o DashboardLayoutComponent).
    -->
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'proyecto-angular';
}
