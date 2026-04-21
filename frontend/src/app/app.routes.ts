import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: AuthComponent },
  { path: 'signup', component: AuthComponent },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./admin/admin.component').then(c => c.AdminComponent),
    canActivate: [authGuard], 
    data: { role: 'ADMIN' } 
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
