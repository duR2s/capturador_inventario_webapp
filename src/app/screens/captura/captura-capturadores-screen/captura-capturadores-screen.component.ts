import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// Componentes Hijos
import { InputsCapturaPartialComponent } from '../../../partials/captura/inputs-captura-partial/inputs-captura-partial.component';
import { TablaCapturaPartialComponent } from '../../../partials/captura/tabla-captura-partial/tabla-captura-partial.component';
import { InfoCapturaSidebarComponent } from '../../../modals/captura/info-captura-sidebar/info-captura-sidebar.component';

// Servicios e Interfaces
import { CapturaService } from '../../../services/documents/captura.service';
import { ErrorsService } from '../../../services/tools/errors.service';
import { PayloadDetalleBatch } from '../../../captura.interfaces';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogModalComponent } from '../../../modals/utilities/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-captura-capturadores-screen',
  standalone: true,
  imports: [
    CommonModule,
    InputsCapturaPartialComponent,
    TablaCapturaPartialComponent,
    InfoCapturaSidebarComponent,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './captura-capturadores-screen.component.html',
  styleUrls: ['./captura-capturadores-screen.component.scss']
})
export class CapturaCapturadoresScreenComponent implements OnInit {

  public capturaService = inject(CapturaService);
  private _errorsService = inject(ErrorsService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild('inputsComponent') inputsComponent!: InputsCapturaPartialComponent;

  public isLoading: boolean = false;
  public colaPendientes: PayloadDetalleBatch[] = [];
  public productoTemporal: any | null = null;

  public get capturaActual() {
    return this.capturaService.capturaActualValue;
  }

  public get totalDetallesCount(): number {
    return this.capturaService.detallesActualesValue?.length || 0;
  }

  public get isReadOnly(): boolean {
    const estado = this.capturaActual?.estado;
    return estado === 'CONFIRMADO' || estado === 'PROCESADO';
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
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Error actualizando datos:", err);
      }
    });
  }

  // --- LÓGICA DE CAPTURA ACTUALIZADA ---

  public procesarBusqueda(codigo: string): void {
    if (!codigo) return;
    this.isLoading = true;
    this.productoTemporal = null;

    const almacenId = this.capturaActual?.almacen;

    this.capturaService.buscarArticulo(codigo, almacenId).subscribe({
      next: (dataArticulo) => {
        this.isLoading = false;
        this.productoTemporal = dataArticulo;
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this._errorsService.mostrarError("Producto no encontrado o error de conexión.");
      }
    });
  }

  /**
   * CORREGIDO: Uso de ID de artículo para evitar errores por diferencias de string
   */
  public procesarGuardado(datos: { codigo: string, cantidad: number }): void {
    if (this.isLoading) return;

    // 1. Verificamos si tenemos info temporal para checar duplicados
    if (this.productoTemporal) {
        const esDuplicado = this.verificarDuplicadoPorID(this.productoTemporal.id);

        if (esDuplicado) {
            const dialogRef = this.dialog.open(ConfirmationDialogModalComponent, {
                data: {
                    type: 'advertisement',
                    title: 'Producto ya capturado',
                    message: `El producto "${this.productoTemporal.nombre}" ya existe en la lista. ¿Deseas sumar la cantidad?`,
                    confirmText: 'Sí, Sumar',
                    cancelText: 'Cancelar'
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    // Pasamos el ID del productoTemporal para asegurar match en backend
                    this.ejecutarGuardadoReal(datos.codigo, datos.cantidad, this.productoTemporal.id);
                } else {
                    this.productoTemporal = null;
                    if (this.inputsComponent) this.inputsComponent.limpiarFormulario();
                }
            });
            return;
        }

        // Si no es duplicado pero tenemos el ID (captura normal por búsqueda), lo enviamos
        this.ejecutarGuardadoReal(datos.codigo, datos.cantidad, this.productoTemporal.id);
    } else {
        // Caso: Captura manual sin búsqueda previa (Enter rápido) o offline sin cache
        // Solo enviamos código
        this.ejecutarGuardadoReal(datos.codigo, datos.cantidad);
    }
  }

  private ejecutarGuardadoReal(codigo: string, cantidad: number, articuloId?: number): void {
    // Enviamos articuloId si lo tenemos
    this.capturaService.escanearArticulo(codigo, cantidad, articuloId).subscribe({
      next: (detalle) => {
        this._errorsService.mostrarExito(`Guardado: ${detalle.articulo_nombre}`);
        this.productoTemporal = null;
        if (this.inputsComponent) this.inputsComponent.limpiarFormulario();
      },
      error: (err) => {
        const mensajeError = err.message || '';
        const esOffline = mensajeError.includes('0') || mensajeError.toLowerCase().includes('unknown error');

        if (esOffline) {
          this.agregarAColaOffline(codigo, cantidad, articuloId);
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

    // Comparación robusta usando el campo 'articulo' que ahora es el ID numérico
    return detallesActuales.some(d => {
        // En caso de que la interfaz antigua o mezcla de datos traiga objeto o null
        const idEnDetalle = (typeof d.articulo === 'object' && d.articulo !== null)
                            ? (d.articulo as any).id
                            : d.articulo;

        return Number(idEnDetalle) === Number(idArticuloNuevo);
    });
  }

  private agregarAColaOffline(codigo: string, cantidad: number, articuloId?: number): void {
    const nuevoItem: PayloadDetalleBatch = {
      producto_codigo: codigo,
      cantidad_contada: cantidad,
      articulo_id: articuloId // Guardamos el ID también para sync futura
    };
    this.colaPendientes.push(nuevoItem);
    this._errorsService.mostrarAlerta(`Guardado localmente (${this.colaPendientes.length} pendientes).`);
  }

  // --- ACCIONES DEL SIDEBAR Y CIERRE ---

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
      this._errorsService.mostrarError("Tiene datos pendientes por sincronizar.");
      return;
    }
    const id = this.capturaActual?.id;
    if (id) {
        this.capturaService.terminarCaptura(id).subscribe({
            next: () => this._router.navigate(['/home/captura']),
            error: (err) => this._errorsService.mostrarError(err.message)
        });
    }
  }

  public eliminarCapturaActual(): void {
    const id = this.capturaActual?.id;
    if (!id) return;

    this.isLoading = true;
    this.capturaService.eliminarCaptura(id).subscribe({
      next: () => {
        this.isLoading = false;
        this._errorsService.mostrarExito("Captura eliminada correctamente.");
        this._router.navigate(['/home/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this._errorsService.mostrarError("No se pudo eliminar la captura: " + err.message);
      }
    });
  }

  public descargarReporteExcel(): void {
    if (!this.capturaActual || !this.capturaActual.id) {
      this._errorsService.mostrarError("No hay información de captura para descargar.");
      return;
    }

    this.isLoading = true;
    this.capturaService.descargarExcel(this.capturaActual.id).subscribe({
      next: (blob) => {
        this.isLoading = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Captura_${this.capturaActual?.folio}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this._errorsService.mostrarExito("Archivo descargado correctamente.");
      },
      error: (err) => {
        this.isLoading = false;
        this._errorsService.mostrarError("Error al generar el archivo Excel.");
        console.error(err);
      }
    });
  }
}
