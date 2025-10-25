import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-dashboard-inicio-screen',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './dashboard-inicio-screen.component.html',
  styleUrls: ['./dashboard-inicio-screen.component.scss']
})
export class DashboardInicioScreenComponent {

}
