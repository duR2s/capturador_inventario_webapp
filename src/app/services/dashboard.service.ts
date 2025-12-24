import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FacadeService } from 'src/app/services/facade.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = `${environment.url_api || 'http://localhost:8000'}`;

  // Endpoints del Dashboard
  // Nota: Asegúrate de que coincidan con las URLs definidas en tu urls.py
  private readonly KPI_ENDPOINT = `${this.API_URL}/dashboard/kpi/`;
  private readonly CHARTS_ENDPOINT = `${this.API_URL}/dashboard/charts/`;

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService
  ) {}

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

  /**
   * Obtiene los indicadores clave (KPIs) del mes actual:
   * - Artículos actualizados
   * - Capturas realizadas
   * - Top capturador
   * - Próxima sincronización
   */
  public getDashboardKPIs(): Observable<any> {
    return this.http.get<any>(this.KPI_ENDPOINT, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene los datos históricos para las gráficas (últimos 5 meses):
   * - Diferencias vs Exactas
   * - Total de capturas por mes
   */
  public getDashboardCharts(): Observable<any[]> {
    return this.http.get<any[]>(this.CHARTS_ENDPOINT, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Manejo de errores consistente con CapturaService
  private handleError(error: HttpErrorResponse) {
    let msg = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      msg = `Error cliente: ${error.error.message}`;
    } else {
      msg = error.error?.detail || error.error?.error || `Error Servidor: ${error.status}`;
      if (typeof error.error === 'object' && !error.error.detail && !error.error.error) {
        msg = JSON.stringify(error.error);
      }
    }
    console.error(msg);
    return throwError(() => new Error(msg));
  }
}
