import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from '../facade.service';
import { ValidatorService } from '../tools/validator.service';
import { ErrorsService } from '../tools/errors.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  // Dependencias inyectadas
  private http = inject(HttpClient);
  private facadeService = inject(FacadeService);
  private validatorService = inject(ValidatorService);
  private errorService = inject(ErrorsService);

  // --- SEPARACIÓN DE ENDPOINTS ---
  // Para obtener el listado completo
  private readonly API_LISTA_URL = `${environment.url_api}/lista-usuarios/`;
  // Para operaciones sobre un usuario específico (CRUD)
  private readonly API_GESTION_URL = `${environment.url_api}/usuarios/`;

  constructor() { }

  // --- 1. ESQUEMA DE DATOS UNIFICADO ---
  public getEsquemaBase(rolInicial: 'ADMIN' | 'CAPTURADOR' = 'CAPTURADOR') {
    return {
      id: null,
      puesto: rolInicial,
      clave_interna: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmar_password: '',
      telefono: '',
      rfc: '',
      fecha_nacimiento: '',
      edad: ''
    };
  }

  // --- 2. VALIDACIÓN UNIFICADA ---
  public validarUsuario(data: any, esEdicion: boolean) {
    let error: any = {};
    const esAdmin = data.puesto === 'ADMIN';

    if (!this.validatorService.required(data["first_name"])) error["first_name"] = this.errorService.required;
    if (!this.validatorService.required(data["last_name"])) error["last_name"] = this.errorService.required;
    if (!this.validatorService.required(data["clave_interna"])) error["clave_interna"] = this.errorService.required;

    if (!this.validatorService.required(data["email"])) {
      error["email"] = this.errorService.required;
    } else if (!this.validatorService.email(data['email'])) {
      error['email'] = this.errorService.email;
    }

    if (!esEdicion) {
      if (!this.validatorService.required(data["password"])) error["password"] = this.errorService.required;
      if (data["password"] !== data["confirmar_password"]) error["confirmar_password"] = "Las contraseñas no coinciden";
    }

    if (!this.validatorService.required(data["rfc"])) {
      error["rfc"] = this.errorService.required;
    } else if (!this.validatorService.min(data["rfc"], 12) || !this.validatorService.max(data["rfc"], 13)) {
      error["rfc"] = "RFC debe tener 12 o 13 caracteres";
    }

    if (!this.validatorService.required(data["fecha_nacimiento"])) {
      error["fecha_nacimiento"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["telefono"])) error["telefono"] = this.errorService.required;

    return error;
  }

  // --- 3. MÉTODOS HTTP ---

  private getHeaders(): HttpHeaders {
    const token = this.facadeService.getSessionToken();
    const headersConfig = { 'Content-Type': 'application/json' };
    if (token) {
      return new HttpHeaders({ ...headersConfig, 'Authorization': 'Bearer ' + token });
    }
    return new HttpHeaders(headersConfig);
  }

  /**
   * USA EL NUEVO ENDPOINT: /lista-usuarios/
   */
  public obtenerUsuarios(rol?: string, busqueda?: string): Observable<any[]> {
    let params = new HttpParams();
    if (rol) params = params.set('rol', rol);
    if (busqueda) params = params.set('q', busqueda);

    return this.http.get<any[]>(this.API_LISTA_URL, { headers: this.getHeaders(), params });
  }

  /**
   * USA EL ENDPOINT DE GESTIÓN: /usuarios/
   */
  public obtenerUsuarioPorID(id: number): Observable<any> {
    return this.http.get<any>(this.API_GESTION_URL, {
      headers: this.getHeaders(),
      params: new HttpParams().set('id', id)
    });
  }

  public guardarUsuario(data: any, esEdicion: boolean): Observable<any> {
    if (esEdicion) {
      return this.http.put<any>(this.API_GESTION_URL, data, { headers: this.getHeaders() });
    } else {
      return this.http.post<any>(this.API_GESTION_URL, data, { headers: this.getHeaders() });
    }
  }

  public eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(this.API_GESTION_URL, {
      headers: this.getHeaders(),
      params: new HttpParams().set('id', id)
    });
  }
}
