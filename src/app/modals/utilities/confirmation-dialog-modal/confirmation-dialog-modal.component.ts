import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Definimos los tipos permitidos para mayor seguridad
export type ModalType = 'danger' | 'advertisement' | 'info';

export interface ModalData {
  type: ModalType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirmation-dialog-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirmation-dialog-modal.component.html',
  styleUrls: ['./confirmation-dialog-modal.component.scss']
})
export class ConfirmationDialogModalComponent implements OnInit {

  public iconName: string = 'info';
  public defaultTitle: string = 'Información';

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalData
  ) {}

  ngOnInit(): void {
    this.configureModal();
  }

  private configureModal() {
    switch (this.data.type) {
      case 'danger':
        this.iconName = 'error_outline'; // O 'warning'
        this.defaultTitle = '¡Atención!';
        break;
      case 'advertisement':
        this.iconName = 'campaign'; // Icono de megáfono o alerta
        this.defaultTitle = 'Aviso';
        break;
      case 'info':
        this.iconName = 'info_outline';
        this.defaultTitle = 'Información';
        break;
    }
  }

  // Cierra retornando false (Cancelar)
  close() {
    this.dialogRef.close(false);
  }

  // Cierra retornando true (Confirmar)
  confirm() {
    this.dialogRef.close(true);
  }
}
