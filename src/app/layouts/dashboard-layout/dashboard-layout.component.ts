import { Component, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material imports
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  // RouterModule provee RouterOutlet, RouterLink y RouterLinkActive
  // Añadimos los módulos de Angular Material que usa el layout
  imports: [CommonModule, RouterModule, MatSidenavModule, MatListModule, MatIconModule, MatToolbarModule, MatButtonModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent {
  // Referencia al sidenav para controlarlo desde el template/TS
  @ViewChild('sidenav') sidenav!: MatSidenav;

  // Métodos de conveniencia
  openSidenav(): void { this.sidenav?.open(); }
  closeSidenav(): void { this.sidenav?.close(); }
}
