import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';


import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-tabla-captura-partial',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule,
      MatTableModule,
      MatFormFieldModule,
      MatCardModule,
      MatIconModule
    ],
  templateUrl: './tabla-captura-partial.component.html',
  styleUrls: ['./tabla-captura-partial.component.scss']
})
export class TablaCapturaPartialComponent {

}
