import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Importamos tus servicios de utilería existentes
import { FacadeService } from '../facade.service';
import { ErrorsService } from '../tools/errors.service';
import { ValidatorService } from '../tools/validator.service';

@Injectable({
  providedIn: 'root'
})
export class DetalleCapturaService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  // -------------------------------------------------------------------------
  // 1. ESQUEMAS Y VALIDACIONES (Lógica Frontend)
  // -------------------------------------------------------------------------

  public esquemaCaptura() {
    return {
      'codigo': '',
      'cantidad': '',
      'nombre': '', // Campo auxiliar de visualización
      'imagen': ''  // Campo auxiliar de visualización
    };
  }

  public validarCaptura(data: any) {
    let error: any = {};

    // Validar Código
    if (!this.validatorService.required(data["codigo"])) {
      error["codigo"] = this.errorService.required;
    }

    // Validar Cantidad
    if (!this.validatorService.required(data["cantidad"])) {
      error["cantidad"] = this.errorService.required;
    } else if (!this.validatorService.numeric(data["cantidad"])) {
      error["cantidad"] = this.errorService.numeric;
    } else if (data["cantidad"] <= 0) {
      error["cantidad"] = "La cantidad debe ser mayor a 0";
    }

    return error;
  }

  // -------------------------------------------------------------------------
  // 2. SERVICIOS HTTP (Conexión Django)
  // -------------------------------------------------------------------------

  /**
   * Busca un artículo por su código (Clave interna, Barras o Auxiliar).
   * Backend esperado: GET /articulo/?search=CODIGO
   */
  public buscarArticulo(codigo: string): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.warn("No se encontró el token del usuario");
    }

    // Asumimos un endpoint de búsqueda flexible en Django
    return this.http.get<any>(`${environment.url_api}/articulo/?search=${codigo}`, { headers });
  }

  /**
   * Registra el conteo físico en la base de datos.
   * Backend esperado: POST /captura/detalle/
   */
  public registrarConteo(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    // Mapeo de datos para el backend (snake_case típico de Python/Django)
    const payload = {
      producto_codigo: data.codigo,
      cantidad_contada: data.cantidad
      // folio: data.folio (Si se requiere el folio de la sesión actual)
    };

    return this.http.post<any>(`${environment.url_api}/captura/detalle/`, payload, { headers });
  }
}
