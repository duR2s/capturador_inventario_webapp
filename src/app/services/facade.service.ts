import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Inyección del nuevo servicio

// Estas son variables para las cookies
const session_cookie_name = 'capturador_inventario-token';
const user_email_cookie_name = 'capturador_inventario-email';
const user_id_cookie_name = 'capturador_inventario-user_id';
const user_complete_name_cookie_name = 'capturador_inventario-user_complete_name';
const group_name_cookie_name = 'capturador_inventario-group_name';

@Injectable({
  providedIn: 'root',
})
export class FacadeService {

  constructor(
    public router: Router,
    private cookieService: CookieService,
    private authService: AuthService // Inyectamos AuthService
  ) { }

  // --- Lógica de Negocio / Puente a AuthService ---

  // Validar login (Delega en AuthService)
  public validarLogin(username: String, password: String) {
    return this.authService.validarLogin({ username, password });
  }

  // Iniciar sesión
  public login(username: String, password: String): Observable<any> {
    let data = {
      username: username,
      password: password
    };
    return this.authService.login(data);
  }

  // Cerrar sesión
  public logout(): Observable<any> {
    const token = this.getSessionToken();
    return this.authService.logout(token);
  }

  // Obtener usuario actual
  public retrieveSignedUser() {
    const token = this.getSessionToken();
    return this.authService.me(token);
  }

  // --- Manejo de Cookies (Intacto) ---

  getCookieValue(key: string) {
    return this.cookieService.get(key);
  }

  saveCookieValue(key: string, value: string) {
    var secure = environment.url_api.indexOf("https") != -1;
    this.cookieService.set(key, value, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
  }

  getSessionToken() {
    return this.cookieService.get(session_cookie_name);
  }

  saveUserData(user_data: any) {
    var secure = environment.url_api.indexOf("https") !== -1;
    let id = user_data.id || user_data.user?.id;
    let email = user_data.email || user_data.user?.email;
    let first_name = user_data.first_name || user_data.user?.first_name || '';
    let last_name = user_data.last_name || user_data.user?.last_name || '';
    let name = (first_name + " " + last_name).trim();

    this.cookieService.set(user_id_cookie_name, id, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(user_email_cookie_name, email, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(user_complete_name_cookie_name, name, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(session_cookie_name, user_data.token, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(group_name_cookie_name, user_data.rol, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
  }

  destroyUser() {
    this.cookieService.deleteAll();
  }

  getUserEmail() {
    return this.cookieService.get(user_email_cookie_name);
  }

  getUserCompleteName() {
    return this.cookieService.get(user_complete_name_cookie_name);
  }

  getUserId() {
    return this.cookieService.get(user_id_cookie_name);
  }

  getUserGroup() {
    return this.cookieService.get(group_name_cookie_name);
  }
}
