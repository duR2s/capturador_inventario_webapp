import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, AfterViewInit, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

// Importa tu interfaz de Captura
import { Captura } from '../../../captura.interfaces';

//Importar Servicios
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-tabla-lista-capturas',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './tabla-lista-capturas.component.html',
  styleUrls: ['./tabla-lista-capturas.component.scss']
})
export class TablaListaCapturasComponent implements OnChanges, AfterViewInit {

  // Recibe los datos desde el padre (MenuCaptura)
  @Input() capturas: Captura[] = [];

  // Eventos para acciones
  @Output() onView = new EventEmitter<Captura>();
  @Output() onEdit = new EventEmitter<Captura>();
  @Output() onDelete = new EventEmitter<Captura>();

  // Configuración de la tabla
  dataSource = new MatTableDataSource<Captura>([]);
  displayedColumns: string[] = [
    'estado_indicator', // Círculo de color
    'folio',
    'almacen',
    'capturador',
    'fecha',
    'estado_text',      // Texto subrayado
    'acciones'
  ];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public isAdmin: boolean = false;

  private facadeService = inject(FacadeService);

  constructor() {}

  ngOnInit(): void {
    // 1. Verificar si es ADMIN
    const rol = this.facadeService.getUserGroup();
    this.isAdmin = (rol === 'ADMIN');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['capturas'] && this.capturas) {
      this.dataSource.data = this.capturas;
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Personalizar filtro para buscar también por nombre de almacén o capturador
    this.dataSource.filterPredicate = (data: Captura, filter: string) => {
      const searchStr = (
        data.folio +
        data.almacen_nombre +
        data.capturador_nombre +
        data.estado
      ).toLowerCase();
      return searchStr.includes(filter);
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // --- Helpers Visuales ---

  getStatusClass(estado: string): string {
    switch (estado) {
      case 'BORRADOR': return 'status-orange';
      case 'CONFIRMADO': return 'status-green';
      case 'PROCESADO': return 'status-blue';
      default: return 'status-gray';
    }
  }

  getStatusLabel(estado: string): string {
    switch (estado) {
      case 'BORRADOR': return 'Pendiente';
      case 'CONFIRMADO': return 'Sincronización Local';
      case 'PROCESADO': return 'Sincronizado';
      default: return 'Desconocido';
    }
  }
}
