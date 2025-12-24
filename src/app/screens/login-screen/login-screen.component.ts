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
  public generalErrorMessage: string | null = null; // Mensaje global de error
  public load: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.generalErrorMessage = null;
  }

  // Toggle para ver/ocultar contraseña
  public showPassword() {
    this.type = (this.type == 'password') ? 'text' : 'password';
  }

  public login(): boolean {
    // 1. Reiniciar estados
    this.errors = {};
    this.generalErrorMessage = null;

    // 2. Validación local (Campos vacíos, formato email, etc.)
    this.errors = this.facadeService.validarLogin(this.username, this.password);

    if(Object.keys(this.errors).length > 0){
      return false; // Detener si hay errores locales
    }

    this.load = true;

    // 3. Llamada al servicio
    this.facadeService.login(this.username, this.password).subscribe({
      next: (response:any) => {
        // Éxito: Guardar sesión y navegar
        this.facadeService.saveUserData(response);
        this.router.navigate(["/home"]);
        this.load = false;
      },
      error: (error:any) => {
        this.load = false;
        console.error("Error en el login:", error);

        // --- MANEJO DE ERRORES DE FEEDBACK ---

        if (error.status === 400 || error.status === 401) {
          // Credenciales inválidas (Lo más común)
          this.generalErrorMessage = "El correo o la contraseña son incorrectos.";
        }
        else if (error.status === 0) {
          // Error de conexión (Servidor apagado o sin internet)
          this.generalErrorMessage = "No hay conexión con el servidor. Verifique su red.";
        }
        else if (error.error && error.error.non_field_errors) {
          // Errores específicos de Django Rest Framework
          this.generalErrorMessage = error.error.non_field_errors[0];
        }
        else {
          // Error genérico
          this.generalErrorMessage = "Ocurrió un error inesperado. Intente más tarde.";
        }
      }
    });

    return true;
  }
}
