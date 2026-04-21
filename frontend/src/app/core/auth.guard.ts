import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const requiredRole = route.data['role'];
    if (requiredRole && authService.getRole() !== requiredRole) {
      router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};
