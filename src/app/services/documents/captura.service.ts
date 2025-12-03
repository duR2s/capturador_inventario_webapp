import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from '../facade.service';
import { ErrorsService } from '../tools/errors.service';
import { ValidatorService } from '../tools/validator.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
// CLASE RENOMBRADA para evitar conflicto con CapturadoresService (Gestión de usuarios)
export class CapturaService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  // Esquema base del objeto JSON para la captura
  public esquemaCaptura() {
    return {
      'folio': '',
      'capturador': this.facadeService.getUserId(), // ID del usuario logueado
      'estado': 'PROGRESO',
      'modo_offline': false,
      'fecha_reportada': new Date().toISOString(),
      'detalles': [] // Array de { producto_codigo, cantidad_contada }
    }
  }

  // Validación para el formulario de captura
  public validarCaptura(data: any) {
    console.log("Validando captura... ", data);
    let error: any = {};

    // Validar cabecera
    if (!this.validatorService.required(data["folio"])) {
      error["folio"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["capturador"])) {
      error["capturador"] = "Es necesario iniciar sesión para capturar";
    }

    if (!data["detalles"] || data["detalles"].length === 0) {
      error["detalles"] = "Debe agregar al menos un producto a la lista";
    } else {
      // Validar detalles internos si existen
      // (Opcional: devolver errores específicos por índice si la UI lo soporta)
      for (let item of data["detalles"]) {
        if (!this.validatorService.required(item["producto_codigo"])) {
          error["lista_productos"] = "Uno de los productos no tiene código";
          break;
        }
        if (!this.validatorService.required(item["cantidad_contada"])) {
            error["lista_productos"] = "Uno de los productos no tiene cantidad";
            break;
        } else if (!this.validatorService.numeric(item["cantidad_contada"])) {
            error["lista_productos"] = this.errorService.numeric;
            break;
        } else if (item["cantidad_contada"] < 0) {
            error["lista_productos"] = "La cantidad no puede ser negativa";
            break;
        }
      }
    }

    return error;
  }

  // Validar un item individual (útil para validar al momento de agregar a la tabla)
  public validarItemDetalle(item: any) {
    let error: any = {};
    if (!this.validatorService.required(item["producto_codigo"])) {
      error["producto_codigo"] = this.errorService.required;
    }

    if (!this.validatorService.required(item["cantidad_contada"])) {
      error["cantidad_contada"] = this.errorService.required;
    } else if (!this.validatorService.numeric(item["cantidad_contada"])) {
      error["cantidad_contada"] = this.errorService.numeric;
    }

    return error;
  }

  // --- Servicios HTTP ---

  // Servicio para registrar la captura de inventario
  public registrarCaptura(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.post<any>(`${environment.url_api}/inventario/captura/`, data, { headers });
  }
}
