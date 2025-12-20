import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { FacadeService } from '../app/services/facade.service'; // Asegúrate de que la ruta de importación sea correcta

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private facadeService: FacadeService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    // 1. Preguntamos al FacadeService si existe un token de sesión
    const token = this.facadeService.getSessionToken();

    // 2. Si hay token, dejamos pasar al usuario
    if (token) {
      return true;
    }

    // 3. Si NO hay token, redirigimos al login
    console.log('Acceso denegado: No se encontró token de sesión.');
    return this.router.createUrlTree(['/login']);
  }
}
