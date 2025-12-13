import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// Componentes Hijos (Standalone)
import { InputsCapturaPartialComponent } from '../../../partials/captura/inputs-captura-partial/inputs-captura-partial.component';
import { TablaCapturaPartialComponent } from '../../../partials/captura/tabla-captura-partial/tabla-captura-partial.component';

// Servicios
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

  public capturaService = inject(CapturaService);
  private _errorsService = inject(ErrorsService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);

  public isLoading: boolean = false;
  public colaPendientes: PayloadDetalleBatch[] = [];

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
        console.log("Sesión recuperada exitosamente:", captura);
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Error recuperando sesión:", err);
        this._errorsService.mostrarError("No se pudo recuperar la sesión de captura. Verifique el ID o su conexión.");
        this._router.navigate(['/home/dashboard']);
      }
    });
  }

  private verificarSesionEnMemoria(): void {
    const captura = this.capturaService.capturaActualValue;
    if (!captura || !captura.id) {
      this._errorsService.mostrarError("No se detectó una sesión activa y no se proporcionó ID.");
      this._router.navigate(['/home/dashboard']);
    } else {
      this.cargarDatosServidor(captura.id);
    }
  }

  private cargarDatosServidor(id: number): void {
    this.isLoading = true;
    this.capturaService.cargarDetalles(id).subscribe({
      next: () => this.isLoading = false,
      error: (err) => {
        this.isLoading = false;
        console.error("Error cargando detalles iniciales:", err);
      }
    });
  }

  // -------------------------------------------------------------------------
  // HANDLERS (EVENTOS DE LOS COMPONENTES HIJOS)
  // -------------------------------------------------------------------------

  public onEscanear(datos: { codigo: string, cantidad: number }): void {
    if (this.isLoading) return;
    // console.log("Enviando petición al servidor...", datos); // Debug Frontend

    this.capturaService.escanearArticulo(datos.codigo, datos.cantidad).subscribe({

      next: (detalle) => {
        console.log("Escaneo registrado en servidor:", detalle);
        // Aquí podrías poner un sonido de éxito o notificación pequeña
      },
      error: (err) => {
        // --- MODIFICACIÓN PARA DEBUG ONLINE ---
        console.error("ERROR REAL DEL BACKEND:", err);

        // Descomentar esta línea si quieres ver el error crudo en pantalla
        alert(JSON.stringify(err));

        const mensajeError = err.message || '';

        // Solo consideraremos offline si es status 0 (Network Error) REAL.
        // Muchos bloqueos de CORS también dan status 0, así que ojo con esto.
        const esOffline = mensajeError.includes('0') ||
                          mensajeError.toLowerCase().includes('unknown error');

        if (esOffline) {
          console.warn("Detectado posible modo offline o bloqueo de red.");
          this.agregarAColaOffline(datos.codigo, datos.cantidad);
        } else {
          // Si es error 400, 403, 500, etc., lo mostramos al usuario.
          this._errorsService.mostrarError(`Error del Servidor: ${mensajeError}`);
        }
      }

    });
  }

  private agregarAColaOffline(codigo: string, cantidad: number): void {
    const nuevoItem: PayloadDetalleBatch = {
      producto_codigo: codigo,
      cantidad_contada: cantidad
    };

    this.colaPendientes.push(nuevoItem);
    this._errorsService.mostrarAlerta(
      `Sin conexión (o bloqueo de red). Guardado localmente (${this.colaPendientes.length} pendientes).`
    );
  }

  public sincronizarPendientes(): void {
    if (this.colaPendientes.length === 0) return;

    this.isLoading = true;
    this.capturaService.sincronizarMasivo(this.colaPendientes).subscribe({
      next: (listaActualizada) => {
        this.isLoading = false;
        this.colaPendientes = [];
        this._errorsService.mostrarExito("Sincronización completada. Datos actualizados.");
      },
      error: (err) => {
        this.isLoading = false;
        this._errorsService.mostrarError("No se pudo sincronizar. Verifique su conexión a internet.");
      }
    });
  }

  public finalizarCaptura(): void {
    if (this.colaPendientes.length > 0) {
      this._errorsService.mostrarError("Tiene datos pendientes. Sincronice antes de terminar la captura.");
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
