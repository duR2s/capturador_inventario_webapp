// --- app.component.ts ---
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// 1. IMPORTAR EL MÓDULO AQUÍ TAMBIÉN
import { MatIconRegistry, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. AGREGAR MatIconModule AL ARRAY DE IMPORTS
  imports: [RouterOutlet, MatIconModule],
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'proyecto-angular';

  constructor(private iconRegistry: MatIconRegistry) {
    this.iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }
}
