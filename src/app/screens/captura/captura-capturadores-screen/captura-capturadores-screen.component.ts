import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablaCapturaPartialComponent } from 'src/app/partials/captura/tabla-captura-partial/tabla-captura-partial.component';
import { InputsCapturaPartialComponent } from 'src/app/partials/captura/inputs-captura-partial/inputs-captura-partial.component';

//Material Imports
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-captura-capturadores-screen',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    TablaCapturaPartialComponent,
    InputsCapturaPartialComponent
],
  templateUrl: './captura-capturadores-screen.component.html',
  styleUrls: ['./captura-capturadores-screen.component.scss']
})
export class CapturaCapturadoresScreenComponent {

}
