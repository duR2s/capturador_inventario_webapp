import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importa los nuevos componentes "parciales" que usarás
import { LoginPartialComponent } from "src/app/partials/login/login-partial/login-partial.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-partial-screen',
  standalone: true,
  // Importa los componentes que vas a usar en la plantilla.
  imports: [
    CommonModule,
    LoginPartialComponent,
    RouterLink
],
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.scss']
})
export class LoginScreenComponent {
}

