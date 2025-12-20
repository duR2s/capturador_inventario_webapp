import { DashboardInicioScreenComponent } from './screens/dashboard/dashboard-inicio-screen/dashboard-inicio-screen.component';
import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { RegistroUsuariosScreenComponent } from './screens/registro-usuarios-screen/registro-usuarios-screen.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { CapturaCapturadoresScreenComponent } from './screens/captura/captura-capturadores-screen/captura-capturadores-screen.component';
import { MenuCapturaComponent } from './screens/captura/menu-captura/menu-captura.component';
// 1. Importamos el Guard que acabamos de crear
import { AuthGuard } from './auth.guard';

// --- app.routes.ts ---
// Este archivo define las rutas principales de la aplicación.

export const routes: Routes = [
  // Rutas de Autenticación (Públicas)
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginScreenComponent },
      { path: 'registro', component: RegistroUsuariosScreenComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Rutas del Dashboard (Privadas)
  {
    path: 'home',
    component: DashboardLayoutComponent,
    // 2. APLICAMOS EL GUARD AQUÍ
    // Al ponerlo en la ruta padre, protege automáticamente a todos sus hijos (dashboard, captura, form/:id)
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardInicioScreenComponent},
      { path: 'captura', component: MenuCapturaComponent},

      // CAMBIO IMPORTANTE: Agregamos /:id para recibir el parámetro
      // Esto permite entrar directamente a una captura específica (ej. /captura/form/15)
      { path: 'captura/form/:id', component: CapturaCapturadoresScreenComponent},

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
