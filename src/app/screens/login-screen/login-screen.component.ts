import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.scss']
})
export class LoginScreenComponent implements OnInit {

  public router = inject(Router);
  private facadeService = inject(FacadeService);

  public username: string = "";
  public password: string = "";
  public type: string = "password";
  public errors: any = {};
  public load: boolean = false;
  public generalErrorMessage: string | null = null;

  constructor() {}

  ngOnInit(): void {
    // Aquí puedes realizar alguna comprobación inicial si es necesario
  }

  public login(): boolean {
    this.errors = {};
    this.generalErrorMessage = null;

    // Asumo que validarLogin devuelve un objeto de errores
    this.errors = this.facadeService.validarLogin(this.username, this.password);

    if(Object.keys(this.errors).length > 0){
      return false; // Retorna si hay errores de validación
    }

    this.load = true;

    // Llamar al servicio de login
    this.facadeService.login(this.username, this.password).subscribe({
      next: (response:any) => {
        // Guardar el token en las cookies (asumiendo que saveUserData lo hace)
        this.facadeService.saveUserData(response);

        // Redirigir según el rol
        const role = response.rol;
        let route = "/home"; // Ruta por defecto

        if (role === 'administrador') {
          route = "/administrador";
        } else if (role === 'maestro') {
          route = "/maestros";
        } else if (role === 'alumno') {
          route = "/alumnos";
        }

        this.router.navigate([route]);
        this.load = false;
      },
      error: (error:any) => {
        this.load = false;
        console.error("Error en el login:", error);
        this.generalErrorMessage = "Credenciales inválidas. Por favor, inténtalo de nuevo. (" + (error.statusText || 'Error desconocido') + ")";
      }
    });

    return true;
  }

  public showPassword(): void {
    this.type = this.type === "password" ? "text" : "password";
  }

  public registrar(): void {
    this.router.navigate(["registro"]);
  }
}
