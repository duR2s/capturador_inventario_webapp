import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importa los nuevos componentes "parciales" que usaras
import { LoginPartialComponent } from "src/app/partials/login/login-partial/login-partial.component";
import { RouterLink } from '@angular/router';

// Angular Material modules used by this component's template
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login-partial-screen',
  standalone: true,
  // Importa los componentes que vas a usar en la plantilla.
  imports: [
    CommonModule,
    LoginPartialComponent,
    RouterLink,
    MatCardModule,
    MatButtonModule
],
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.scss']
})
export class LoginScreenComponent {
}

