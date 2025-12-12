import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Componentes Hijos (Standalone)
import { InputsCapturaPartialComponent } from '../../../partials/captura/inputs-captura-partial/inputs-captura-partial.component';
import { TablaCapturaPartialComponent } from '../../../partials/captura/tabla-captura-partial/tabla-captura-partial.component';

// Servicios
// IMPORTANTE: Ruta actualizada según tu solicitud para conectar con el nuevo servicio híbrido
import { CapturaService } from '../../../services/documents/captura.service';
import { ErrorsService } from '../../../services/tools/errors.service';

// Interfaces
import { PayloadDetalleBatch } from '../../../captura.interfaces';

@Component({
  selector: 'app-captura-capturadores-screen',
  standalone: true,
  imports: [
    CommonModule,
    InputsCapturaPartialComponent,
    TablaCapturaPartialComponent
  ],
  templateUrl: './captura-capturadores-screen.component.html',
  styleUrls: ['./captura-capturadores-screen.component.scss']
})
export class CapturaCapturadoresScreenComponent implements OnInit {

  // --- INYECCIÓN DE DEPENDENCIAS ---
  // Inyectamos el servicio que contiene la lógica de BehaviorSubject y Sincronización
  public capturaService = inject(CapturaService);
  private _errorsService = inject(ErrorsService);
  private _router = inject(Router);

  // --- ESTADO LOCAL ---
  public isLoading: boolean = false;

  // Cola temporal para guardar escaneos si falla el internet (Modo Offline Simplificado)
  public colaPendientes: PayloadDetalleBatch[] = [];

  // Getter para facilitar el acceso a la cabecera en el HTML
  public get capturaActual() {
    return this.capturaService.capturaActualValue;
  }

  ngOnInit(): void {
    this.verificarSesionActiva();
  }

  /**
   * Valida que exista una cabecera de captura activa en el servicio.
   * Si no hay sesión (ej. recarga de página sin persistencia), redirige al dashboard.
   */
  private verificarSesionActiva(): void {
    const captura = this.capturaService.capturaActualValue;

    if (!captura || !captura.id) {
      this._errorsService.mostrarError("No se detectó una sesión de captura activa.");
      this._router.navigate(['/home/dashboard']);
    } else {
      // Si hay sesión, intentamos refrescar los datos del servidor para tener la última versión
      this.cargarDatosServidor(captura.id);
    }
  }

  /**
   * Carga los detalles iniciales desde el servidor al iniciar la pantalla.
   */
  private cargarDatosServidor(id: number): void {
    this.isLoading = true;
    this.capturaService.cargarDetalles(id).subscribe({
      next: () => this.isLoading = false,
      error: (err) => {
        this.isLoading = false;
        // No bloqueamos la app, pero avisamos que podría no estar actualizada la tabla
        console.error("Error cargando detalles iniciales:", err);
      }
    });
  }

  // -------------------------------------------------------------------------
  // HANDLERS (EVENTOS DE LOS COMPONENTES HIJOS)
  // -------------------------------------------------------------------------

  /**
   * Método vinculado al Output del componente <app-inputs-captura-partial>
   * Ejecuta la lógica "Online First": intenta enviar al servidor, si falla, guarda localmente.
   */
  public onEscanear(datos: { codigo: string, cantidad: number }): void {
    if (this.isLoading) return; // Evitar doble envío

    // Llamada al método online del servicio
    this.capturaService.escanearArticulo(datos.codigo, datos.cantidad).subscribe({
      next: (detalle) => {
        // ÉXITO ONLINE:
        // El servicio ya actualizó el BehaviorSubject 'detalles$', por lo que la tabla
        // se actualizará automáticamente. Solo damos feedback en consola.
        console.log("Escaneo registrado en servidor:", detalle);
      },
      error: (err) => {
        // MANEJO DE ERRORES & OFFLINE FALLBACK
        const mensajeError = err.message || '';

        // Detectamos si es un error de conexión (status 0 o mensaje típico de offline)
        // Ajusta esta condición según cómo tu interceptor o navegador reporte el offline
        const esOffline = mensajeError.includes('0') ||
                          mensajeError.toLowerCase().includes('conexión') ||
                          mensajeError.toLowerCase().includes('network');

        if (esOffline) {
          this.agregarAColaOffline(datos.codigo, datos.cantidad);
        } else {
          // Errores de negocio (ej. "Código no existe"), estos sí se muestran al usuario
          this._errorsService.mostrarError(mensajeError);
        }
      }
    });
  }

  /**
   * Almacena el ítem en memoria temporal (colaPendientes) cuando no hay conexión.
   */
  private agregarAColaOffline(codigo: string, cantidad: number): void {
    const nuevoItem: PayloadDetalleBatch = {
      producto_codigo: codigo,
      cantidad_contada: cantidad
    };

    this.colaPendientes.push(nuevoItem);

    // Notificación sutil (Toast warning) para que el usuario sepa que está trabajando offline
    this._errorsService.mostrarAlerta(
      `Sin conexión. Guardado localmente (${this.colaPendientes.length} pendientes).`
    );
  }

  /**
   * Método vinculado al botón "Sincronizar" en la UI.
   * Envía todos los ítems acumulados en colaPendientes al endpoint masivo.
   */
  public sincronizarPendientes(): void {
    if (this.colaPendientes.length === 0) return;

    this.isLoading = true;

    this.capturaService.sincronizarMasivo(this.colaPendientes).subscribe({
      next: (listaActualizada) => {
        this.isLoading = false;
        this.colaPendientes = []; // Limpiamos la cola tras el éxito
        this._errorsService.mostrarExito("Sincronización completada. Datos actualizados.");
      },
      error: (err) => {
        this.isLoading = false;
        this._errorsService.mostrarError("No se pudo sincronizar. Verifique su conexión a internet.");
      }
    });
  }

  /**
   * Finaliza la sesión de captura.
   * Evita cerrar si hay datos pendientes de sincronizar.
   */
  public finalizarCaptura(): void {
    if (this.colaPendientes.length > 0) {
      this._errorsService.mostrarError("Tiene datos pendientes. Sincronice antes de terminar la captura.");
      return;
    }

    const id = this.capturaActual?.id;
    if (id) {
        this.capturaService.terminarCaptura(id).subscribe({
            next: () => this._router.navigate(['/dashboard']),
            error: (err) => this._errorsService.mostrarError(err.message)
        });
    }
  }
}
