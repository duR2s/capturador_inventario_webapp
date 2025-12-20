import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, forkJoin } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Captura, DetalleCaptura, PayloadEscaner, PayloadDetalleBatch } from '../../captura.interfaces';
import { FacadeService } from 'src/app/services/facade.service';

@Injectable({
  providedIn: 'root'
})
export class CapturaService {
  private readonly API_URL = `${environment.url_api || 'http://localhost:8000'}`;

  // Endpoints
  private readonly CAPTURA_ENDPOINT = `${this.API_URL}/inventario/captura/`;
  private readonly DETALLE_ENDPOINT = `${this.API_URL}/inventario/detalle/`;
  private readonly ALMACENES_ENDPOINT = `${this.API_URL}/inventario/almacenes/`;
  private readonly EMPLEADOS_ENDPOINT = `${this.API_URL}/lista-empleados/`;
  private readonly BUSQUEDA_ENDPOINT = `${this.API_URL}/inventario/buscar-articulo/`;
  private readonly TICKET_ENDPOINT = `${this.API_URL}/inventario/ticket/`;

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

  // --- Listar mis capturas ---
  listarMisCapturas(): Observable<Captura[]> {
    return this.http.get<Captura[]>(this.CAPTURA_ENDPOINT, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getAlmacenes(): Observable<any[]> { return this.http.get<any[]>(this.ALMACENES_ENDPOINT, { headers: this.getHeaders() }).pipe(catchError(this.handleError)); }
  getCapturadores(): Observable<any[]> { return this.http.get<any[]>(this.EMPLEADOS_ENDPOINT, { headers: this.getHeaders() }).pipe(catchError(this.handleError)); }
  cargarCatalogosIniciales(): Observable<{ almacenes: any[], capturadores: any[] }> { return forkJoin({ almacenes: this.getAlmacenes(), capturadores: this.getCapturadores() }); }

  buscarArticulo(codigo: string, almacenId?: number): Observable<any> {
    let url = `${this.BUSQUEDA_ENDPOINT}?codigo=${encodeURIComponent(codigo)}`;
    if (almacenId) {
      url += `&almacen=${almacenId}`;
    }
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(catchError(this.handleError));
  }

  iniciarCaptura(folio: string, capturadorId: number, almacenId: number): Observable<Captura> {
    const payload: any = { folio: folio, capturador: capturadorId, almacen: almacenId, estado: 'BORRADOR', detalles: [] };
    return this.http.post<Captura>(this.CAPTURA_ENDPOINT, payload, { headers: this.getHeaders() }).pipe(
      tap((captura) => { this._capturaActualSubject.next(captura); this._detallesSubject.next([]); }),
      catchError(this.handleError)
    );
  }

  // --- NUEVO: Actualizar Cabecera (PATCH) ---
  actualizarCaptura(id: number, data: Partial<Captura>): Observable<Captura> {
    const url = `${this.CAPTURA_ENDPOINT}${id}/`;
    return this.http.patch<Captura>(url, data, { headers: this.getHeaders() }).pipe(
      tap((capturaActualizada) => {
        // Si estamos editando la captura actual en memoria, actualizamos el subject también
        const actual = this.capturaActualValue;
        if (actual && actual.id === id) {
           this._capturaActualSubject.next({ ...actual, ...capturaActualizada });
        }
      }),
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

  eliminarCaptura(capturaId: any): Observable<void> {
    const url = `${this.CAPTURA_ENDPOINT}${capturaId}/`;
    return this.http.delete<void>(url, { headers: this.getHeaders() }).pipe(
      tap(() => {
        this._capturaActualSubject.next(null);
        this._detallesSubject.next([]);
      }),
      catchError(this.handleError)
    );
  }

  cargarDetalles(capturaId: any): Observable<DetalleCaptura[]> {
    return this.cargarCapturaPorId(capturaId).pipe(map(captura => captura.detalles || []));
  }

  escanearArticulo(codigo: string, cantidad: number, articuloId?: number): Observable<DetalleCaptura> {
    const capturaActual = this.capturaActualValue;
    if (!capturaActual || !capturaActual.id) {
      return throwError(() => new Error("No hay una captura activa."));
    }

    const payload: PayloadEscaner = {
      captura_id: capturaActual.id,
      producto_codigo: codigo,
      cantidad_contada: cantidad,
      articulo_id: articuloId
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

  actualizarDetalle(detalleId: any, nuevaCantidad: number): Observable<DetalleCaptura> {
    const url = `${this.DETALLE_ENDPOINT}${detalleId}/`;
    const payload = { cantidad_contada: nuevaCantidad };
    return this.http.patch<DetalleCaptura>(url, payload, { headers: this.getHeaders() }).pipe(
      tap((itemActualizado) => {
        const listaActual = this._detallesSubject.value;
        const index = listaActual.findIndex(d => d.id === detalleId);
        if (index > -1) {
          const nuevaLista = [...listaActual];
          const ticketsPrevios = nuevaLista[index].tickets;
          nuevaLista[index] = { ...nuevaLista[index], ...itemActualizado };
           if (ticketsPrevios && !nuevaLista[index].tickets) {
             nuevaLista[index].tickets = ticketsPrevios;
          }
          this._detallesSubject.next(nuevaLista);
        }
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

  sincronizarMasivo(detallesBatch: PayloadDetalleBatch[]): Observable<DetalleCaptura[]> {
    const capturaActual = this.capturaActualValue;
    if (!capturaActual || !capturaActual.id) return throwError(() => new Error("No se puede sincronizar sin una captura activa."));
    if (!detallesBatch || detallesBatch.length === 0) return throwError(() => new Error("La lista de sincronización está vacía."));

    const url = `${this.CAPTURA_ENDPOINT}${capturaActual.id}/sincronizar/`;
    return this.http.post<DetalleCaptura[]>(url, detallesBatch, { headers: this.getHeaders() }).pipe(
      tap((listaActualizadaServer) => {
        this._detallesSubject.next(listaActualizadaServer);
      }),
      catchError(this.handleError)
    );
  }

  generarTicket(detalleId: any, cantidad: number, responsable: string): Observable<any> {
    const url = this.TICKET_ENDPOINT;
    const payload = {
      detalle: detalleId,
      cantidad: cantidad,
      responsable: responsable
    };

    return this.http.post(url, payload, { headers: this.getHeaders() }).pipe(
      tap((response: any) => {
        if (response.nueva_cantidad_detalle !== undefined) {
           const listaActual = this._detallesSubject.value;
           const index = listaActual.findIndex(d => d.id === detalleId);
           if (index > -1) {
             const nuevaLista = [...listaActual];
             const itemViejo = nuevaLista[index];
             nuevaLista[index] = {
                ...itemViejo,
                cantidad_contada: response.nueva_cantidad_detalle
             };
             this._detallesSubject.next(nuevaLista);
           }
        }
      }),
      catchError(this.handleError)
    );
  }

  descargarExcel(capturaId: number): Observable<Blob> {
    const url = `${this.CAPTURA_ENDPOINT}${capturaId}/excel/`;
    return this.http.get(url, { headers: this.getHeaders(), responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let msg = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      msg = `Error cliente: ${error.error.message}`;
    } else {
      if (error.error instanceof Blob) {
         msg = `Error Servidor: ${error.status} (Archivo no generado)`;
      } else {
        msg = error.error?.detail || error.error?.error || `Error Servidor: ${error.status}`;
        if (typeof error.error === 'object' && !error.error.detail && !error.error.error) msg = JSON.stringify(error.error);
      }
    }
    console.error(msg);
    return throwError(() => new Error(msg));
  }
}
