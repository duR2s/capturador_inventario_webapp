import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from '../facade.service';
import { ErrorsService } from '../tools/errors.service';
import { ValidatorService } from '../tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AdministradoresService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaAdmin() {
    return {
      'rol': 'ADMIN',
      'clave_admin': '',
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'telefono': '',
      'rfc': '',
      'fecha_nacimiento': '', // Obligatorio
      'edad': '' // Se ignorará en validación y envío manual
    }
  }

  //Validación para el formulario
  public validarAdmin(data: any, editar: boolean) {
    console.log("Validando admin... ", data);
    let error: any = {};

    if (!this.validatorService.required(data["clave_admin"])) {
      error["clave_admin"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["first_name"])) {
      error["first_name"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["last_name"])) {
      error["last_name"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["email"])) {
      error["email"] = this.errorService.required;
    } else if (!this.validatorService.max(data["email"], 40)) {
      error["email"] = this.errorService.max(40);
    } else if (!this.validatorService.email(data['email'])) {
      error['email'] = this.errorService.email;
    }

    if (!editar) {
      if (!this.validatorService.required(data["password"])) {
        error["password"] = this.errorService.required;
      }

      if (!this.validatorService.required(data["confirmar_password"])) {
        error["confirmar_password"] = this.errorService.required;
      }
    }

    if (!this.validatorService.required(data["rfc"])) {
      error["rfc"] = this.errorService.required;
    } else if (!this.validatorService.min(data["rfc"], 12)) {
      error["rfc"] = this.errorService.min(12);
    } else if (!this.validatorService.max(data["rfc"], 13)) {
      error["rfc"] = this.errorService.max(13);
    }

    // NUEVO: Validación requerida de fecha de nacimiento
    if (!this.validatorService.required(data["fecha_nacimiento"])) {
      error["fecha_nacimiento"] = this.errorService.required;
    }

    // ELIMINADO: Validación de edad manual
    // if (!this.validatorService.required(data["edad"])) { ... }

    if (!this.validatorService.required(data["telefono"])) {
      error["telefono"] = this.errorService.required;
    }

    return error;
  }

  // --- SERVICIOS HTTP ---

  private getHeaders(): HttpHeaders {
    const token = this.facadeService.getSessionToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    }
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  public registrarAdmin(data: any): Observable<any> {
    return this.http.post<any>(`${environment.url_api}/admin/`, data, { headers: this.getHeaders() });
  }

  public obtenerListaAdmins(): Observable<any> {
    return this.http.get<any>(`${environment.url_api}/lista-admins/`, { headers: this.getHeaders() });
  }

  public obtenerAdminPorID(idAdmin: number): Observable<any> {
    return this.http.get<any>(`${environment.url_api}/admin/?id=${idAdmin}`, { headers: this.getHeaders() });
  }

  public eliminarAdmin(idAdmin: number): Observable<any>{
    return this.http.delete<any>(`${environment.url_api}/admin/?id=${idAdmin}`, { headers: this.getHeaders() });
  }

  public actualizarAdmin(data: any): Observable<any> {
    return this.http.put<any>(`${environment.url_api}/admin/`, data, { headers: this.getHeaders() });
  }
}
