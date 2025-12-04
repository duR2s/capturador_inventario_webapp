import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';

// Importamos los componentes hijos
import { SidenavComponent } from '../../partials/dashboard/side-nav/side-nav.component';
import { ToolbarComponent } from '../../partials/dashboard/tool-bar/tool-bar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  // Importamos SidenavComponent y ToolbarComponent aquí
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    SidenavComponent,
    ToolbarComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
}
