import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { routes } from './app.routes';

// --- app.config.ts ---
// Este es el corazón de la configuración de tu aplicación standalone.
// Aquí "provees" o "inyectas" las funcionalidades globales que usarás.
// Reemplaza al app.module.ts en muchos aspectos.

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Configura las rutas que definimos en app.routes.ts
    provideRouter(routes),

    // 2. Habilita las animaciones del navegador
    provideAnimations(),

    // 3. Importa los módulos necesarios para que estén disponibles en toda la app.
    //    - FormsModule: para usar ngModel en formularios.
    //    - HttpClientModule: para hacer peticiones HTTP a un backend.
    importProvidersFrom(FormsModule, HttpClientModule),

    // 4. Provee el MatSnackBarModule globalmente para que los servicios 'root' puedan inyectarlo
    importProvidersFrom(MatSnackBarModule)
  ]
};
