import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importa las herramientas para formularios reactivos
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-registro-capturador',
  standalone: true,
  // Asegúrate de importar ReactiveFormsModule y los módulos Material aquí
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './registro-capturador.component.html',
  styleUrls: ['./registro-capturador.component.scss']
})
export class RegistroCapturadorComponent implements OnInit {
  // Declaramos la propiedad para nuestro formulario, añadiendo "!"
  registroForm!: FormGroup;

  // Inyectamos el FormBuilder para ayudarnos a crear el formulario
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    // En ngOnInit, definimos la estructura y las validaciones del formulario
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    // Por ahora, solo mostraremos los datos en la consola si el formulario es válido
    if (this.registroForm.valid) {
      console.log('Formulario enviado:', this.registroForm.value);
      // ¡Aquí es donde en el futuro llamarías a tu servicio para registrar al usuario!
    } else {
      console.log('El formulario no es válido.');
    }
  }
}

