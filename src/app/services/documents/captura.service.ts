import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, forkJoin } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { Captura, DetalleCaptura, PayloadEscaner, PayloadDetalleBatch } from '../../captura.interfaces';
import { FacadeService } from 'src/app/services/facade.service';

@Injectable({
  providedIn: 'root'
})
export class CapturaService {
  private readonly API_URL = `${environment.url_api || 'http://localhost:8000'}`;

  private readonly CAPTURA_ENDPOINT = `${this.API_URL}/inventario/captura/`;
  private readonly DETALLE_ENDPOINT = `${this.API_URL}/inventario/detalle/`;
  private readonly ALMACENES_ENDPOINT = `${this.API_URL}/inventario/almacenes/`;
  private readonly EMPLEADOS_ENDPOINT = `${this.API_URL}/lista-empleados/`;

  // NUEVO ENDPOINT
  private readonly BUSQUEDA_ENDPOINT = `${this.API_URL}/inventario/buscar-articulo/`;

  private _detallesSubject = new BehaviorSubject<DetalleCaptura[]>([]);
  public detalles$ = this._detallesSubject.asObservable();

  private _capturaActualSubject = new BehaviorSubject<Captura | null>(null);
  public capturaActual$ = this._capturaActualSubject.asObservable();

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService
  ) {}

  public get capturaActualValue(): Captura | null {
    return this._capturaActualSubject.value;
  }

  public get detallesActualesValue(): DetalleCaptura[] {
    return this._detallesSubject.value;
  }

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

  // ... (Métodos de catálogos sin cambios) ...
  getAlmacenes(): Observable<any[]> { return this.http.get<any[]>(this.ALMACENES_ENDPOINT, { headers: this.getHeaders() }).pipe(catchError(this.handleError)); }
  getCapturadores(): Observable<any[]> { return this.http.get<any[]>(this.EMPLEADOS_ENDPOINT, { headers: this.getHeaders() }).pipe(catchError(this.handleError)); }
  cargarCatalogosIniciales(): Observable<{ almacenes: any[], capturadores: any[] }> { return forkJoin({ almacenes: this.getAlmacenes(), capturadores: this.getCapturadores() }); }

  iniciarCaptura(folio: string, capturadorId: number, almacenId: number): Observable<Captura> {
    const payload: any = { folio: folio, capturador: capturadorId, almacen: almacenId, estado: 'BORRADOR', detalles: [] };
    return this.http.post<Captura>(this.CAPTURA_ENDPOINT, payload, { headers: this.getHeaders() }).pipe(
      tap((captura) => { this._capturaActualSubject.next(captura); this._detallesSubject.next([]); }),
      catchError(this.handleError)
    );
  }

  cargarCapturaPorId(id: number): Observable<Captura> {
    const url = `${this.CAPTURA_ENDPOINT}${id}/`;
    return this.http.get<Captura>(url, { headers: this.getHeaders() }).pipe(
      tap((captura) => {
        this._capturaActualSubject.next(captura);
        this._detallesSubject.next(captura.detalles || []);
      }),
      catchError(this.handleError)
    );
  }

  terminarCaptura(capturaId: any): Observable<any> {
    const url = `${this.CAPTURA_ENDPOINT}${capturaId}/`;
    return this.http.patch(url, { estado: 'CONFIRMADO' }, { headers: this.getHeaders() }).pipe(
      tap(() => { this._capturaActualSubject.next(null); this._detallesSubject.next([]); }),
      catchError(this.handleError)
    );
  }

  cargarDetalles(capturaId: any): Observable<DetalleCaptura[]> {
    return this.cargarCapturaPorId(capturaId).pipe(map(captura => captura.detalles || []));
  }

  // -------------------------------------------------------------------------
  // NUEVO MÉTODO DE BÚSQUEDA (SOLO LECTURA)
  // -------------------------------------------------------------------------
  buscarArticulo(codigo: string): Observable<any> {
    const url = `${this.BUSQUEDA_ENDPOINT}?codigo=${encodeURIComponent(codigo)}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // -------------------------------------------------------------------------
  // MÉTODO PARA GUARDAR (PROCESAR ESCANEO)
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

    return this.http.post<DetalleCaptura>(this.DETALLE_ENDPOINT, payload, { headers: this.getHeaders() }).pipe(
      tap((itemRespuesta) => {
        const listaActual = this._detallesSubject.value;
        const indiceExistente = listaActual.findIndex(d => d.id === itemRespuesta.id);

        if (indiceExistente > -1) {
          const listaActualizada = [...listaActual];
          listaActualizada[indiceExistente] = itemRespuesta;
          listaActualizada.splice(indiceExistente, 1);
          listaActualizada.unshift(itemRespuesta);
          this._detallesSubject.next(listaActualizada);
        } else {
          this._detallesSubject.next([itemRespuesta, ...listaActual]);
        }
      }),
      catchError(this.handleError)
    );
  }

  // -------------------------------------------------------------------------
  // NUEVOS MÉTODOS DE EDICIÓN Y TICKET (REQUERIDOS PARA LA UI)
  // -------------------------------------------------------------------------

  actualizarDetalle(detalleId: any, nuevaCantidad: number): Observable<DetalleCaptura> {
    const url = `${this.DETALLE_ENDPOINT}${detalleId}/`;
    // Usamos PATCH para actualización parcial
    const payload = { cantidad_contada: nuevaCantidad };

    return this.http.patch<DetalleCaptura>(url, payload, { headers: this.getHeaders() }).pipe(
      tap((itemActualizado) => {
        // Actualizamos el estado local inmediatamente
        const listaActual = this._detallesSubject.value;
        const index = listaActual.findIndex(d => d.id === detalleId);

        if (index > -1) {
          const nuevaLista = [...listaActual];
          // Fusionamos por si el servidor devuelve campos extra actualizados (ej. diferencia)
          nuevaLista[index] = { ...nuevaLista[index], ...itemActualizado };
          this._detallesSubject.next(nuevaLista);
        }
      }),
      catchError(this.handleError)
    );
  }

  imprimirTicket(detalleId: any, cantidad: number, responsable: string): Observable<any> {
    // Asumimos un endpoint tipo /inventario/detalle/{id}/imprimir-ticket/
    const url = `${this.DETALLE_ENDPOINT}${detalleId}/imprimir_ticket/`;
    const payload = { copias: cantidad, responsable: responsable };

    return this.http.post(url, payload, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // -------------------------------------------------------------------------

  sincronizarMasivo(detallesBatch: PayloadDetalleBatch[]): Observable<DetalleCaptura[]> {
    const capturaActual = this.capturaActualValue;
    if (!capturaActual || !capturaActual.id) return throwError(() => new Error("No se puede sincronizar sin una captura activa."));
    if (!detallesBatch || detallesBatch.length === 0) return throwError(() => new Error("La lista de sincronización está vacía."));

    const url = `${this.CAPTURA_ENDPOINT}${capturaActual.id}/sincronizar/`;

    return this.http.post<DetalleCaptura[]>(url, detallesBatch, { headers: this.getHeaders() }).pipe(
      tap((listaActualizadaServer) => {
        console.log('Sincronización exitosa.');
        this._detallesSubject.next(listaActualizadaServer);
      }),
      catchError(this.handleError)
    );
  }

  eliminarDetalle(detalleId: any): Observable<void> {
    const url = `${this.DETALLE_ENDPOINT}${detalleId}/`;
    return this.http.delete<void>(url, { headers: this.getHeaders() }).pipe(
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
      if (typeof error.error === 'object' && !error.error.detail && !error.error.error) msg = JSON.stringify(error.error);
    }
    console.error(msg);
    return throwError(() => new Error(msg));
  }
}
