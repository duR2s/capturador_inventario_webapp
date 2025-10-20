import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importa las herramientas para formularios reactivos
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-registro-administradores',
  standalone: true,
  // Asegúrate de importar ReactiveFormsModule aquí
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-administradores.component.html',
  styleUrls: ['./registro-administradores.component.scss']
})
export class RegistroAdministradoresComponent implements OnInit {
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

