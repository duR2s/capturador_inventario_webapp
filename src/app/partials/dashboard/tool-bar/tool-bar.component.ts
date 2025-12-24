import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss']
})
export class ToolbarComponent implements OnInit {

  // Inyecciones
  private facadeService = inject(FacadeService);
  private router = inject(Router);

  // Recibimos el estado de la sidenav
  @Input() isSidebarOpen: boolean = false;
  @Output() menuClick = new EventEmitter<void>();

  public userName: string = '';

  ngOnInit(): void {
    // Obtenemos el nombre del usuario desde el Facade (que lee la cookie)
    this.userName = this.facadeService.getUserCompleteName();
  }

  onToggleClick(): void {
    this.menuClick.emit();
  }

  public logout(): void {
    // Primero intentamos logout en backend
    this.facadeService.logout().subscribe({
      next: () => {
        this.finalizarSesion();
      },
      error: (err) => {
        console.error('Error al cerrar sesión en servidor', err);
        // Aun si falla el backend, cerramos sesión localmente
        this.finalizarSesion();
      }
    });
  }

  private finalizarSesion() {
    this.facadeService.destroyUser(); // Borra cookies
    this.router.navigate(['login']);  // Redirige al login
  }
}
