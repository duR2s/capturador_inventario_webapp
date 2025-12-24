import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

//Importar Servicios
import { FacadeService } from '../../../services/facade.service';

@Component({
  selector: 'app-tabla-usuarios',
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
  templateUrl: './tabla-usuarios.component.html',
  styleUrls: ['./tabla-usuarios.component.scss']
})
export class TablaUsuariosComponent implements OnChanges, AfterViewInit {

  // Recibimos la lista de usuarios (admin o empleados)
  @Input() usuarios: any[] = [];
  @Input() _isAdmin: boolean = true;


  // Eventos para acciones
  @Output() onDelete = new EventEmitter<any>();
  @Output() onChangeRole = new EventEmitter<any>();
  // Nuevo: Evento para editar en lugar de navegar
  @Output() onEdit = new EventEmitter<any>();

  // Configuración de la tabla
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'puesto_indicator', // Círculo de color según rol
    'clave',
    'nombre',
    'email',
    'telefono',
    'puesto_text',      // Texto del rol
    'acciones'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuarios'] && this.usuarios) {
      this.dataSource.data = this.usuarios;
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Filtro personalizado
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = (
        (data.clave_interna || '') +
        (data.user?.first_name || '') +
        (data.user?.last_name || '') +
        (data.user?.email || '') +
        (data.puesto || '')
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

  // --- ACCIONES ---

  editarUsuario(usuario: any) {
    // Emitimos el usuario al padre para que él decida cómo mostrar el formulario
    this.onEdit.emit(usuario);
  }

  cambiarPermisos(usuario: any) {
    this.onChangeRole.emit(usuario);
  }

  eliminarUsuario(usuario: any) {
    this.onDelete.emit(usuario);
  }

  // --- Helpers Visuales ---

  getRoleClass(puesto: string): string {
    switch (puesto) {
      case 'ADMIN': return 'role-admin';
      case 'CAPTURADOR': return 'role-user';
      case 'OTRO': return 'role-other';
      default: return 'role-gray';
    }
  }

  getRoleLabel(puesto: string): string {
    switch (puesto) {
      case 'ADMIN': return 'Administrador';
      case 'CAPTURADOR': return 'Capturador';
      case 'OTRO': return 'Otro';
      default: return 'Sin Asignar';
    }
  }
}
