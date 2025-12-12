import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegistroCapturaComponent } from 'src/app/partials/captura/registro-captura/registro-captura.component';

@Component({
  selector: 'app-menu-captura',
  standalone: true,
  imports: [
    CommonModule,
    RegistroCapturaComponent
  ],
  templateUrl: './menu-captura.component.html',
  styleUrls: ['./menu-captura.component.scss']
})
export class MenuCapturaComponent {

}
