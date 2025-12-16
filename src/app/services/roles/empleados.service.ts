import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from '../facade.service';
import { ErrorsService } from '../tools/errors.service';
import { ValidatorService } from '../tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaEmpleado() {
    return {
      'puesto': 'CAPTURADOR', // Rol por defecto, puede cambiar en el form
      'clave_interna': '', // ID de trabajador
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'telefono': '',
      'rfc': '',
      'fecha_nacimiento': '', // Obligatorio para cálculo automático de edad
      'edad': '' // Se ignorará en validación y envío (calculado por back)
    }
  }

  // Validación para el formulario de Empleado
  public validarEmpleado(data: any, editar: boolean) {
    console.log("Validando empleado... ", data);
    let error: any = {};

    if (!this.validatorService.required(data["clave_interna"])) {
      error["clave_interna"] = this.errorService.required;
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

    // Validación obligatoria de fecha de nacimiento
    if (!this.validatorService.required(data["fecha_nacimiento"])) {
      error["fecha_nacimiento"] = this.errorService.required;
    }

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

  public registrarEmpleado(data: any): Observable<any> {
    return this.http.post<any>(`${environment.url_api}/empleado/`, data, { headers: this.getHeaders() });
  }

  public obtenerListaEmpleados(): Observable<any> {
    return this.http.get<any>(`${environment.url_api}/lista-empleados/`, { headers: this.getHeaders() });
  }

  public obtenerEmpleadoPorID(idEmpleado: number): Observable<any> {
    return this.http.get<any>(`${environment.url_api}/empleado/?id=${idEmpleado}`, { headers: this.getHeaders() });
  }

  public eliminarEmpleado(idEmpleado: number): Observable<any>{
    return this.http.delete<any>(`${environment.url_api}/empleado/?id=${idEmpleado}`, { headers: this.getHeaders() });
  }

  public actualizarEmpleado(data: any): Observable<any> {
    return this.http.put<any>(`${environment.url_api}/empleado/`, data, { headers: this.getHeaders() });
  }
}
