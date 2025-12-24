import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts'; // Importamos la librería de gráficas
import { MatIconModule } from '@angular/material/icon';

// Componentes
import { DashboardInfoCardComponent } from '../../../modals/dashboard/dashboard-info-card/dashboard-info-card.component';

// Servicios
import { DashboardService } from '../../../services/dashboard.service';
import { FacadeService } from '../../../services/facade.service';

@Component({
  selector: 'app-dashboard-inicio-screen',
  standalone: true,
  imports: [
    CommonModule,
    NgxChartsModule, // Necesario para las gráficas
    DashboardInfoCardComponent,
    MatIconModule
  ],
  templateUrl: './dashboard-inicio-screen.component.html',
  styleUrls: ['./dashboard-inicio-screen.component.scss']
})
export class DashboardInicioScreenComponent implements OnInit {

  private dashboardService = inject(DashboardService);
  private facadeService = inject(FacadeService);

  // --- VARIABLES DE DATOS ---
  public kpis: any = {};
  public userName: string = '';
  public userRole: string = '';
  public isLoading: boolean = true;

  // --- DATOS PARA GRÁFICAS (Formato ngx-charts) ---
  public chartDiferencias: any[] = [];
  public chartExactos: any[] = [];
  public chartCapturas: any[] = [];

  // --- CONFIGURACIÓN DE GRÁFICAS ---
  public showXAxis = true;
  public showYAxis = true;
  public gradient = false;
  public showLegend = false;
  public showXAxisLabel = true;
  public showYAxisLabel = true;
  public yAxisLabel = 'Cantidad';

  // Esquemas de colores basados en tus variables globales
  // Verde (Primary)
  public colorSchemeExactos: Color = {
    name: 'exactos',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#6A994E', '#A7C957', '#386641', '#6A994E', '#A7C957']
  };

  // Rojo/Terracota (Secondary) - Para diferencias
  public colorSchemeDiferencias: Color = {
    name: 'diferencias',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#BC4749', '#C9696B', '#a53b3d', '#BC4749', '#C9696B']
  };

  // Azul/Neutro - Para capturas generales
  public colorSchemeCapturas: Color = {
    name: 'capturas',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#457b9d', '#1d3557', '#a8dadc', '#457b9d', '#1d3557']
  };

  ngOnInit(): void {
    // 1. Obtener Datos del Usuario
    this.userName = this.facadeService.getUserCompleteName() || 'Usuario';
    this.userRole = this.facadeService.getUserGroup() || 'Rol';

    // 2. Cargar Dashboard
    this.cargarDatos();
  }

  cargarDatos() {
    this.isLoading = true;

    // Llamada 1: KPIs
    this.dashboardService.getDashboardKPIs().subscribe({
      next: (data) => {
        console.log('KPIs recibidos:', data); // DEBUG
        this.kpis = data;
        // Formateamos fecha de sincronización si existe
        if (this.kpis.proxima_sincronizacion) {
          const date = new Date(this.kpis.proxima_sincronizacion);
          this.kpis.proxima_sincronizacion_formatted = date.toLocaleString();
        } else {
          this.kpis.proxima_sincronizacion_formatted = 'No programada';
        }
      },
      error: (err) => console.error('Error cargando KPIs:', err)
    });

    // Llamada 2: Gráficas
    this.dashboardService.getDashboardCharts().subscribe({
      next: (data) => {
        console.log('Datos Gráficas recibidos:', data); // DEBUG

        // Transformamos la respuesta del API al formato { name: string, value: number }
        this.chartCapturas = data.map((item: any) => ({
          name: item.nombre_mes, // Ej: "October"
          value: item.capturas_totales
        }));

        this.chartDiferencias = data.map((item: any) => ({
          name: item.nombre_mes,
          value: item.articulos_con_diferencia
        }));

        this.chartExactos = data.map((item: any) => ({
          name: item.nombre_mes,
          value: item.articulos_exactos
        }));

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando Gráficas:', err);
        this.isLoading = false;
      }
    });
  }
}
