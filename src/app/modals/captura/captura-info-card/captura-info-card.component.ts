import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Captura } from '../../../captura.interfaces';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-captura-info-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './captura-info-card.component.html',
  styleUrls: ['./captura-info-card.component.scss']
})
export class CapturaInfoCardComponent implements OnInit {

  @Input() captura: Captura | null = null;
  @Output() onClick = new EventEmitter<void>();

  private facadeService = inject(FacadeService);
  public isAdmin: boolean = false;

  constructor() {}

  ngOnInit(): void {
    const rol = this.facadeService.getUserGroup();
    this.isAdmin = (rol === 'ADMIN');
  }

  get statusColorClass(): string {
    if (!this.captura) return '';
    switch (this.captura.estado) {
      case 'BORRADOR': return 'status-orange';
      case 'CONFIRMADO': return 'status-green';
      case 'PROCESADO': return 'status-blue';
      default: return 'status-gray';
    }
  }

  get statusText(): string {
    if (!this.captura) return '';
    switch (this.captura.estado) {
      case 'BORRADOR': return 'Borrador';
      case 'CONFIRMADO': return 'Confirmado';
      case 'PROCESADO': return 'Procesado';
      default: return 'Desconocido';
    }
  }

  handleClick() {
    this.onClick.emit();
  }
}
