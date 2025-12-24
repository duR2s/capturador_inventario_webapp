import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-info-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard-info-card.component.html',
  styleUrls: ['./dashboard-info-card.component.scss']
})
export class DashboardInfoCardComponent {

  @Input() title: string = 'Título';
  @Input() icon: string = 'info'; // Nombre del icono de Material Icons
  @Input() value: string | number = 0;

  // Opcional: Para variar el color del icono o borde (ej: 'primary', 'secondary', 'warning')
  @Input() colorType: 'primary' | 'secondary' | 'neutral' = 'primary';

  get iconClass(): string {
    return `icon-${this.colorType}`;
  }
}
