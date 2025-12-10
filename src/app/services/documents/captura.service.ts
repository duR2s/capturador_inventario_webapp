import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Captura, DetalleCaptura, PayloadEscaner, PayloadDetalleBatch } from '../../captura.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CapturaService {
  // Configuración de Endpoints
  private readonly API_URL = `${environment.url_api || 'http://localhost:8000'}/api`;

  // Endpoint base: /api/inventario/captura/
  private readonly CAPTURA_ENDPOINT = `${this.API_URL}/inventario/captura/`;
  private readonly DETALLE_ENDPOINT = `${this.API_URL}/inventario/detalle/`;

  // --- STATE MANAGEMENT ---
  private _detallesSubject = new BehaviorSubject<DetalleCaptura[]>([]);
  public detalles$ = this._detallesSubject.asObservable();

  private _capturaActualSubject = new BehaviorSubject<Captura | null>(null);
  public capturaActual$ = this._capturaActualSubject.asObservable();

  constructor(private http: HttpClient) {}

  public get capturaActualValue(): Captura | null {
    return this._capturaActualSubject.value;
  }

  // -------------------------------------------------------------------------
  // MÉTODOS DE GESTIÓN DE CAPTURA (CABECERA)
  // -------------------------------------------------------------------------

  iniciarCaptura(folio: string, capturadorId: number): Observable<Captura> {
    const payload: Partial<Captura> = {
      folio: folio,
      capturador: capturadorId,
      estado: 'PROGRESO',
      detalles: []
    };

    return this.http.post<Captura>(this.CAPTURA_ENDPOINT, payload).pipe(
      tap((captura) => {
        this._capturaActualSubject.next(captura);
        if (captura.detalles && captura.detalles.length > 0) {
          this._detallesSubject.next(captura.detalles);
        } else {
          this._detallesSubject.next([]);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Finaliza la sesión de captura en el backend.
   * Actualiza el estado a 'COMPLETADO' y limpia el estado local.
   */
  terminarCaptura(capturaId: number): Observable<any> {
    // Asumimos un PATCH estándar al ID del recurso para actualizar el estado
    // OJO: Asegúrate que tu backend soporte PATCH en esta ruta o ajusta a un endpoint específico
    const url = `${this.CAPTURA_ENDPOINT}${capturaId}/`;

    return this.http.patch(url, { estado: 'COMPLETADO' }).pipe(
      tap(() => {
        // Limpiar estado al terminar exitosamente
        this._capturaActualSubject.next(null);
        this._detallesSubject.next([]);
      }),
      catchError(this.handleError)
    );
  }

  cargarDetalles(capturaId: number): Observable<DetalleCaptura[]> {
    const url = `${this.CAPTURA_ENDPOINT}${capturaId}/detalles/`; // Asumiendo endpoint GET anidado o filtro
    return this.http.get<DetalleCaptura[]>(url).pipe(
      tap(detalles => this._detallesSubject.next(detalles)),
      catchError(this.handleError)
    );
  }

  // -------------------------------------------------------------------------
  // MODO ONLINE (Línea por Línea)
  // -------------------------------------------------------------------------

  escanearArticulo(codigo: string, cantidad: number): Observable<DetalleCaptura> {
    const capturaActual = this.capturaActualValue;

    if (!capturaActual || !capturaActual.id) {
      return throwError(() => new Error("No hay una captura activa."));
    }

    const payload: PayloadEscaner = {
      captura_id: capturaActual.id,
      producto_codigo: codigo,
      cantidad_contada: cantidad
    };

    return this.http.post<DetalleCaptura>(this.DETALLE_ENDPOINT, payload).pipe(
      tap((nuevoDetalle) => {
        const listaActual = this._detallesSubject.value;
        this._detallesSubject.next([nuevoDetalle, ...listaActual]);
      }),
      catchError(this.handleError)
    );
  }

  // -------------------------------------------------------------------------
  // MODO OFFLINE / RECUPERACIÓN (Batch Sync)
  // -------------------------------------------------------------------------

  sincronizarMasivo(detallesBatch: PayloadDetalleBatch[]): Observable<DetalleCaptura[]> {
    const capturaActual = this.capturaActualValue;

    if (!capturaActual || !capturaActual.id) {
      return throwError(() => new Error("No se puede sincronizar sin una captura activa (ID faltante)."));
    }

    if (!detallesBatch || detallesBatch.length === 0) {
      return throwError(() => new Error("La lista de sincronización está vacía."));
    }

    const url = `${this.CAPTURA_ENDPOINT}${capturaActual.id}/sincronizar/`;

    return this.http.post<DetalleCaptura[]>(url, detallesBatch).pipe(
      tap((listaActualizadaServer) => {
        console.log('Sincronización exitosa. Actualizando estado local...');
        this._detallesSubject.next(listaActualizadaServer);
      }),
      catchError(this.handleError)
    );
  }

  // -------------------------------------------------------------------------
  // CRUD & HELPERS
  // -------------------------------------------------------------------------

  eliminarDetalle(detalleId: number): Observable<void> {
    const url = `${this.DETALLE_ENDPOINT}${detalleId}/`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const listaActual = this._detallesSubject.value;
        this._detallesSubject.next(listaActual.filter(d => d.id !== detalleId));
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let msg = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      msg = `Error cliente: ${error.error.message}`;
    } else {
      msg = error.error?.detail || error.error?.error || `Error Servidor: ${error.status}`;
    }
    console.error(msg);
    return throwError(() => new Error(msg));
  }
}
