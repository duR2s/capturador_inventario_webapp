import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// Componentes Hijos
import { InputsCapturaPartialComponent } from '../../../partials/captura/inputs-captura-partial/inputs-captura-partial.component';
import { TablaCapturaPartialComponent } from '../../../partials/captura/tabla-captura-partial/tabla-captura-partial.component';

// Servicios e Interfaces
import { CapturaService } from '../../../services/documents/captura.service';
import { ErrorsService } from '../../../services/tools/errors.service';
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

  public capturaService = inject(CapturaService);
  private _errorsService = inject(ErrorsService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);

  // Referencia al hijo para poder llamar a limpiarFormulario()
  @ViewChild('inputsComponent') inputsComponent!: InputsCapturaPartialComponent;

  public isLoading: boolean = false;
  public colaPendientes: PayloadDetalleBatch[] = [];

  // Estado temporal del producto buscado (Paso 1 del flujo)
  public productoTemporal: any | null = null;

  public get capturaActual() {
    return this.capturaService.capturaActualValue;
  }

  ngOnInit(): void {
    this._route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.cargarSesionPorId(+idParam);
      } else {
        this.verificarSesionEnMemoria();
      }
    });
  }

  private cargarSesionPorId(id: number): void {
    this.isLoading = true;
    this.capturaService.cargarCapturaPorId(id).subscribe({
      next: (captura) => {
        this.isLoading = false;
        console.log("Sesión recuperada:", captura);
      },
      error: (err) => {
        this.isLoading = false;
        this._errorsService.mostrarError("No se pudo recuperar la sesión.");
        this._router.navigate(['/home/dashboard']);
      }
    });
  }

  private verificarSesionEnMemoria(): void {
    const captura = this.capturaService.capturaActualValue;
    if (!captura || !captura.id) {
      this._errorsService.mostrarError("No se detectó una sesión activa.");
      this._router.navigate(['/home/dashboard']);
    } else {
      this.cargarDatosServidor(captura.id);
    }
  }

  private cargarDatosServidor(id: number): void {
    this.isLoading = true;
    this.capturaService.cargarDetalles(id).subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false
    });
  }

  // -------------------------------------------------------------------------
  // PASO 1: BÚSQUEDA DEL PRODUCTO (Al dar Enter en Código)
  // -------------------------------------------------------------------------
  public procesarBusqueda(codigo: string): void {
    if (!codigo) return;
    this.isLoading = true;
    this.productoTemporal = null; // Reset previo

    this.capturaService.buscarArticulo(codigo).subscribe({
      next: (dataArticulo) => {
        this.isLoading = false;
        // Al asignar esto, el componente hijo detectará el cambio (ngOnChanges),
        // mostrará el nombre y pasará el foco a cantidad.
        this.productoTemporal = dataArticulo;
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this._errorsService.mostrarError("Producto no encontrado o error de conexión.");
        // Opcional: Manejo offline si no encuentra
      }
    });
  }

  // -------------------------------------------------------------------------
  // PASO 2: GUARDADO FINAL (Al confirmar Cantidad)
  // -------------------------------------------------------------------------
  public procesarGuardado(datos: { codigo: string, cantidad: number }): void {
    if (this.isLoading) return;

    // 1. VALIDACIÓN DE DUPLICADOS (Usando ID si está disponible)
    // Usamos el ID del productoTemporal que obtuvimos en el paso 1
    if (this.productoTemporal) {
        const esDuplicado = this.verificarDuplicadoPorID(this.productoTemporal.id);

        if (esDuplicado) {
            // Aquí puedes usar un MatDialog bonito
            const confirmar = confirm(`El producto "${this.productoTemporal.nombre}" YA está capturado en esta sesión. ¿Deseas sumar la cantidad?`);
            if (!confirmar) return;
        }
    } else {
        // Fallback por si acaso se perdió el estado temporal (raro)
        console.warn("No hay producto temporal, validando solo texto...");
    }

    // 2. ENVIAR AL SERVICIO
    this.capturaService.escanearArticulo(datos.codigo, datos.cantidad).subscribe({
      next: (detalle) => {
        // ÉXITO
        this._errorsService.mostrarExito(`Guardado: ${detalle.articulo_nombre}`);

        // Limpiamos el formulario del hijo y el estado temporal
        this.productoTemporal = null;
        if (this.inputsComponent) {
            this.inputsComponent.limpiarFormulario();
        }
      },
      error: (err) => {
        // ERROR / OFFLINE
        const mensajeError = err.message || '';
        const esOffline = mensajeError.includes('0') || mensajeError.toLowerCase().includes('unknown error');

        if (esOffline) {
          this.agregarAColaOffline(datos.codigo, datos.cantidad);
          // También limpiamos en offline
          this.productoTemporal = null;
          this.inputsComponent.limpiarFormulario();
        } else {
          this._errorsService.mostrarError(`Error: ${mensajeError}`);
        }
      }
    });
  }

  private verificarDuplicadoPorID(idArticuloNuevo: number): boolean {
    const detallesActuales = this.capturaService.detallesActualesValue;
    if (!detallesActuales) return false;

    // Buscamos si algún detalle tiene ese mismo ID de artículo
    return detallesActuales.some(d => d.id === idArticuloNuevo);
  }

  // -------------------------------------------------------------------------
  // LOGICA OFFLINE & CIERRE
  // -------------------------------------------------------------------------

  private agregarAColaOffline(codigo: string, cantidad: number): void {
    const nuevoItem: PayloadDetalleBatch = {
      producto_codigo: codigo,
      cantidad_contada: cantidad
    };
    this.colaPendientes.push(nuevoItem);
    this._errorsService.mostrarAlerta(`Guardado localmente (${this.colaPendientes.length} pendientes).`);
  }

  public sincronizarPendientes(): void {
    if (this.colaPendientes.length === 0) return;
    this.isLoading = true;
    this.capturaService.sincronizarMasivo(this.colaPendientes).subscribe({
      next: () => {
        this.isLoading = false;
        this.colaPendientes = [];
        this._errorsService.mostrarExito("Sincronización completada.");
      },
      error: () => {
        this.isLoading = false;
        this._errorsService.mostrarError("Error al sincronizar.");
      }
    });
  }

  public finalizarCaptura(): void {
    if (this.colaPendientes.length > 0) {
      this._errorsService.mostrarError("Tiene datos pendientes.");
      return;
    }
    const id = this.capturaActual?.id;
    if (id) {
        this.capturaService.terminarCaptura(id).subscribe({
            next: () => this._router.navigate(['/home/dashboard']),
            error: (err) => this._errorsService.mostrarError(err.message)
        });
    }
  }
}
