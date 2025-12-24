import { Component, ViewChild, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout'; // Importante para detectar mobile

// Importamos los componentes hijos
import { SidenavComponent } from '../../partials/dashboard/side-nav/side-nav.component';
import { ToolbarComponent } from '../../partials/dashboard/tool-bar/tool-bar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
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
export class DashboardLayoutComponent implements OnInit {

  @ViewChild('sidenav') sidenav!: MatSidenav;

  // Inyectamos el observador de breakpoints
  private breakpointObserver = inject(BreakpointObserver);

  public isMobile: boolean = false;
  public isSidenavOpen: boolean = true; // Estado inicial para desktop

  ngOnInit(): void {
    // Escuchamos cambios en el tamaño de pantalla (780px coincide con tu SCSS)
    this.breakpointObserver.observe(['(max-width: 780px)']).subscribe(result => {
      this.isMobile = result.matches;

      if (this.isMobile) {
        // En móvil: modo 'over' (backdrop) y cerrado por defecto
        this.isSidenavOpen = false;
      } else {
        // En desktop: modo 'side' (empuja contenido) y abierto por defecto
        this.isSidenavOpen = true;
      }
    });
  }

  // Método para sincronizar el estado cuando la sidenav se cierra sola (clic en backdrop)
  onSidenavChange(opened: boolean) {
    this.isSidenavOpen = opened;
  }
}
