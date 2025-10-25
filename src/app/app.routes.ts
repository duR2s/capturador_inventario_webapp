import { DashboardInicioScreenComponent } from './screens/dashboard/dashboard-inicio-screen/dashboard-inicio-screen.component';
import { DashboardSidebarAdministradoresComponent } from './partials/dashboard/dashboard-sidebar-administradores/dashboard-sidebar-administradores.component';
import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { RegistroUsuariosScreenComponent } from './screens/registro-usuarios-screen/registro-usuarios-screen.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { CapturaInventarioComponent } from './layouts/captura/captura-inventario-layout/captura-inventario-layout.component';

// --- app.routes.ts ---
// Este archivo define las rutas principales de la aplicación.
// Es el mapa que le dice a Angular qué componente mostrar para cada URL.

export const routes: Routes = [
  // Rutas de Autenticación (login, registro)
  // Usan el AuthLayoutComponent como "plantilla" o "contenedor".
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginScreenComponent },
      { path: 'registro', component: RegistroUsuariosScreenComponent },
      // Si el usuario entra a la raíz del sitio (''), lo redirigimos a '/login'.
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Rutas del Dashboard (lo que ve el usuario después de iniciar sesión)
  // Usan el DashboardLayoutComponent como plantilla.
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    // canActivate: [AuthGuard], // <-- Futuro: Aquí pondrías un guard para proteger la ruta
    children: [
      // Ejemplo de una ruta dentro del dashboard:
      { path: 'inicio', component: DashboardInicioScreenComponent},
    ]
  },

  {
    path: 'captura',
    component: CapturaInventarioComponent,
    // canActivate: [AuthGuard], // <-- Futuro: Aquí pondrías un guard para proteger la ruta
    children: [
      // Ruta PRovisional
      { path: 'inicio', component: DashboardInicioScreenComponent},
    ]
  },

  // Redirección para cualquier otra ruta no encontrada.
  // Es una buena práctica tener esto para manejar URLs incorrectas.
  { path: '**', redirectTo: 'login' }
];
