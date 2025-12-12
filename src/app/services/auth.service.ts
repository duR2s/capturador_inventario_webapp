import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService
  ) { }

  // --- Validaciones ---

  public validarLogin(data: any) {
    console.log("Validando login con datos: ", data);
    let error: any = {};

    if (!this.validatorService.required(data["username"])) {
      error["username"] = this.errorService.required;
    } else if (!this.validatorService.max(data["username"], 40)) {
      error["username"] = this.errorService.max(40);
    } else if (!this.validatorService.email(data['username'])) {
      error['username'] = this.errorService.email;
    }

    if (!this.validatorService.required(data["password"])) {
      error["password"] = this.errorService.required;
    }

    return error;
  }

  // --- Servicios HTTP ---

  // Iniciar sesión
  public login(data: any): Observable<any> {
    return this.http.post<any>(`${environment.url_api}/api/login/`, data, httpOptions);
  }

  // Obtener usuario firmado (Me)
  // Recibe el token como parámetro para evitar dependencia circular con FacadeService
  public me(token: string): Observable<any> {
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/me/`, { headers });
  }

  // Cerrar sesión
  public logout(token: string): Observable<any> {
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/api/logout/`, { headers });
  }
}
