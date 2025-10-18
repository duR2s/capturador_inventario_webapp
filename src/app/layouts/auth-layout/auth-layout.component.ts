import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// --- auth-layout.component.ts ---
// Este componente define la estructura visual para las pantallas de login y registro.
// Por ejemplo, puede tener un logo, un fondo específico, etc.

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth-layout.component.html', // <--- Se cambia a templateUrl
  styleUrls: ['./auth-layout.component.scss']  // <--- Se cambia a styleUrls
})
export class AuthLayoutComponent { }
