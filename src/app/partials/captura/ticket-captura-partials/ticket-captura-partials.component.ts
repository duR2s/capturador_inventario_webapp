import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-ticket-captura-partials',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
],
  templateUrl: './ticket-captura-partials.component.html',
  styleUrls: ['./ticket-captura-partials.component.scss']
})
export class TicketCapturaPartialsComponent {
  // Form
    form: FormGroup;

    constructor(private fb: FormBuilder) {
      this.form = this.fb.group({
        codigo: ['', Validators.required],
        nombre: [''],
        cantidad: [null, [Validators.required, Validators.min(0)]]
      });

    }
}
