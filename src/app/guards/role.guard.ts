import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { Auth } from '@angular/fire/auth';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const auth = inject(Auth);

    // Check if Firebase user is authenticated
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Wait for user data to be loaded if not available yet
    let user = authService.getCurrentUser();
    if (!user) {
      // Wait for user data to load (from onAuthStateChanged)
      return new Promise<boolean>((resolve) => {
        const subscription = authService.currentUser$.subscribe(currentUser => {
          subscription.unsubscribe();
          if (currentUser && allowedRoles.includes(currentUser.role)) {
            resolve(true);
          } else if (currentUser) {
            // User is authenticated but doesn't have the right role
            router.navigate(['/events']); // Redirect to events page instead of unauthorized
            resolve(false);
          } else {
            router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            resolve(false);
          }
        });
        
        // Timeout after 2 seconds
        setTimeout(() => {
          subscription.unsubscribe();
          const currentUser = authService.getCurrentUser();
          if (currentUser && allowedRoles.includes(currentUser.role)) {
            resolve(true);
          } else if (currentUser) {
            router.navigate(['/events']);
            resolve(false);
          } else {
            router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            resolve(false);
          }
        }, 2000);
      });
    }

    // Check if user has required role
    if (allowedRoles.includes(user.role)) {
      return true;
    }

    // User doesn't have required role - redirect to events page
    router.navigate(['/events']);
    return false;
  };
};
