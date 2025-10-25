import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Custom validator to check if passwords match
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

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
      this.registroForm = this.fb.group({
        nombre: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      }, { validators: passwordMatchValidator });
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

