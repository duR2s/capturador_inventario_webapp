import { Component, OnInit, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog'; // Importar Dialog

// Componentes Hijos
import { CapturaInfoCardComponent } from '../../../modals/captura/captura-info-card/captura-info-card.component';
import { RegistroCapturaComponent } from '../../../partials/captura/registro-captura/registro-captura.component';
// NUEVO: Importar la tabla
import { TablaListaCapturasComponent } from '../../../partials/captura/tabla-lista-capturas/tabla-lista-capturas.component';
import { ConfirmationDialogModalComponent } from '../../../modals/utilities/confirmation-dialog-modal/confirmation-dialog-modal.component';

// Servicios
import { CapturaService } from '../../../services/documents/captura.service';
import { Captura } from '../../../captura.interfaces';

@Component({
  selector: 'app-menu-captura',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    CapturaInfoCardComponent,
    RegistroCapturaComponent,
    TablaListaCapturasComponent // Agregar a imports
  ],
  templateUrl: './menu-captura.component.html',
  styleUrls: ['./menu-captura.component.scss']
})
export class MenuCapturaComponent implements OnInit, OnDestroy {

  private capturaService = inject(CapturaService);
  private router = inject(Router);
  private dialog = inject(MatDialog); // Inyectar Dialog

  // Data completa para la tabla
  public todasLasCapturas: Captura[] = [];

  // Fila 1: [NULL (Nueva), ...3 Confirmados, ...3 Procesados]
  public row1Items: (Captura | null)[] = [];

  // Fila 2: [...7 Borradores]
  public row2Items: Captura[] = [];

  public isLoading: boolean = true;
  public showNuevoForm: boolean = false;

  // Refs para Scroll
  @ViewChild('scrollRow1') scrollRow1!: ElementRef<HTMLElement>;
  @ViewChild('scrollRow2') scrollRow2!: ElementRef<HTMLElement>;

  private scrollInterval: any;
  private readonly SCROLL_SPEED = 10;
  private readonly SCROLL_TICK = 10;

  ngOnInit(): void {
    this.cargarCapturas();
  }

  ngOnDestroy(): void {
    this.stopScroll();
  }

  cargarCapturas() {
    this.isLoading = true;
    this.capturaService.listarMisCapturas().subscribe({
      next: (data) => {
        this.todasLasCapturas = data; // Guardamos todo para la tabla
        this.procesarListas(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  private procesarListas(data: Captura[]) {
    // Ordenar por fecha descendente
    const sorted = [...data].sort((a, b) => {
      const dateA = a.fecha_captura ? new Date(a.fecha_captura).getTime() : 0;
      const dateB = b.fecha_captura ? new Date(b.fecha_captura).getTime() : 0;
      return dateB - dateA;
    });

    const borradores = sorted.filter(c => c.estado === 'BORRADOR');
    const confirmados = sorted.filter(c => c.estado === 'CONFIRMADO');
    const procesados = sorted.filter(c => c.estado === 'PROCESADO');

    // Fila 1: Nueva + Top 3 Confirmados + Top 3 Procesados
    this.row1Items = [
      null,
      ...confirmados.slice(0, 3),
      ...procesados.slice(0, 3)
    ];

    // Fila 2: Top 7 Borradores
    this.row2Items = borradores.slice(0, 7);
  }

  // --- Acciones ---

  seleccionarCaptura(captura: Captura | null) {
    if (!captura) return;
    this.router.navigate(['/home/captura/form', captura.id]);
  }

  eliminarCaptura(captura: Captura) {
    const dialogRef = this.dialog.open(ConfirmationDialogModalComponent, {
      data: {
        type: 'danger',
        title: 'Eliminar Captura',
        message: `¿Estás seguro de eliminar la captura folio "${captura.folio}"? Se perderán todos los conteos asociados.`,
        confirmText: 'Sí, Eliminar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.capturaService.eliminarCaptura(captura.id).subscribe({
          next: () => {
            this.cargarCapturas(); // Recargar listas
          },
          error: (err) => {
            console.error(err);
            this.isLoading = false;
            alert('Error al eliminar la captura.');
          }
        });
      }
    });
  }

  crearNueva() {
    this.showNuevoForm = true;
  }

  cancelarNuevo() {
    this.showNuevoForm = false;
    this.cargarCapturas();
  }

  // --- Scroll Logic ---
  startScroll(rowKey: 'row1' | 'row2', direction: number) {
    this.stopScroll();
    const element = rowKey === 'row1' ? this.scrollRow1?.nativeElement : this.scrollRow2?.nativeElement;
    if (!element) return;
    this.scrollInterval = setInterval(() => {
      element.scrollLeft += (this.SCROLL_SPEED * direction);
    }, this.SCROLL_TICK);
  }

  stopScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
    }
  }

  stepScroll(rowKey: 'row1' | 'row2', direction: number) {
    const element = rowKey === 'row1' ? this.scrollRow1?.nativeElement : this.scrollRow2?.nativeElement;
    if (element) {
      element.scrollBy({ left: direction * 300, behavior: 'smooth' });
    }
  }
}
