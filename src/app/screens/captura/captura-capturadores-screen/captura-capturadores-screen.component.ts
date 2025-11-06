import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablaCapturaPartialComponent } from 'src/app/partials/captura/tabla-captura-partial/tabla-captura-partial.component';
import { InputsCapturaPartialComponent } from 'src/app/partials/captura/inputs-captura-partial/inputs-captura-partial.component';
import { TicketCapturaPartialsComponent } from 'src/app/partials/captura/ticket-captura-partials/ticket-captura-partials.component';
import { Dialog, DialogModule } from '@angular/cdk/dialog';

//Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-captura-capturadores-screen',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    TablaCapturaPartialComponent,
    InputsCapturaPartialComponent,
    MatIconModule,
    MatButtonModule,
  DialogModule
],
  templateUrl: './captura-capturadores-screen.component.html',
  styleUrls: ['./captura-capturadores-screen.component.scss']
})
export class CapturaCapturadoresScreenComponent {
  private dialog = inject(Dialog);
  protected openTicketDialog() {
    this.dialog.open(TicketCapturaPartialsComponent);
  }
}
