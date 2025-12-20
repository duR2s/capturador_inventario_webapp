import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

const session_cookie_name = 'capturador_inventario-token';
const user_email_cookie_name = 'capturador_inventario-email';
const user_id_cookie_name = 'capturador_inventario-user_id';
const user_complete_name_cookie_name = 'capturador_inventario-user_complete_name';
const group_name_cookie_name = 'capturador_inventario-group_name'; // Rol Principal
const groups_list_cookie_name = 'capturador_inventario-groups_list'; // Lista completa (NUEVO)

@Injectable({
  providedIn: 'root',
})
export class FacadeService {

  constructor(
    public router: Router,
    private cookieService: CookieService,
    private authService: AuthService
  ) { }

  // --- Lógica de Negocio ---

  public validarLogin(username: String, password: String) {
    return this.authService.validarLogin({ username, password });
  }

  public login(username: String, password: String): Observable<any> {
    let data = { username: username, password: password };
    return this.authService.login(data);
  }

  public logout(): Observable<any> {
    const token = this.getSessionToken();
    return this.authService.logout(token);
  }

  public retrieveSignedUser() {
    const token = this.getSessionToken();
    return this.authService.me(token);
  }

  // --- Manejo de Cookies ---

  saveUserData(user_data: any) {
    var secure = environment.url_api.indexOf("https") !== -1;
    let id = user_data.id || user_data.user?.id;
    let email = user_data.email || user_data.user?.email;
    let first_name = user_data.first_name || user_data.user?.first_name || '';
    let last_name = user_data.last_name || user_data.user?.last_name || '';
    let name = (first_name + " " + last_name).trim();

    // Configuración segura de cookies
    const cookieOptions = (val: string) =>
      this.cookieService.set(val, val, undefined, undefined, undefined, secure, secure ? "None" : "Lax");

    this.cookieService.set(user_id_cookie_name, id, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(user_email_cookie_name, email, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(user_complete_name_cookie_name, name, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(session_cookie_name, user_data.token, undefined, undefined, undefined, secure, secure ? "None" : "Lax");

    // 1. Guardamos el Rol Principal (Singular) - Mantiene compatibilidad
    this.cookieService.set(group_name_cookie_name, user_data.rol, undefined, undefined, undefined, secure, secure ? "None" : "Lax");

    // 2. Guardamos la lista completa (Plural) - Para robustez futura
    if (user_data.roles && Array.isArray(user_data.roles)) {
      this.cookieService.set(groups_list_cookie_name, JSON.stringify(user_data.roles), undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    }
  }

  getSessionToken() {
    return this.cookieService.get(session_cookie_name);
  }

  destroyUser() {
    this.cookieService.deleteAll();
  }

  getUserGroup() {
    return this.cookieService.get(group_name_cookie_name);
  }

  // --- NUEVO MÉTODO DE VALIDACIÓN ROBUSTA ---
  // Usa esto en tus componentes en lugar de comparar strings manualmente
  // Ejemplo: if (this.facade.isInRole('ADMIN')) { ... }
  public isInRole(roleToCheck: string): boolean {
    // 1. Checar rol principal
    const mainRole = this.getUserGroup();
    if (mainRole === roleToCheck) return true;

    // 2. Checar lista de roles (si el usuario tiene múltiples)
    const rolesListStr = this.cookieService.get(groups_list_cookie_name);
    if (rolesListStr) {
      try {
        const roles = JSON.parse(rolesListStr);
        return roles.includes(roleToCheck);
      } catch (e) {
        return false;
      }
    }
    return false;
  }
}
