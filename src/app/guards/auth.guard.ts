import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const auth = inject(Auth);

  // Check if Firebase user is authenticated
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if user data is loaded
  const user = authService.getCurrentUser();
  if (!user) {
    // Wait a bit for user data to load (from onAuthStateChanged)
    // This handles the case where user just signed up
    return new Promise<boolean>((resolve) => {
      const subscription = authService.currentUser$.subscribe(currentUser => {
        subscription.unsubscribe();
        if (currentUser) {
          resolve(true);
        } else {
          router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          resolve(false);
        }
      });
      
      // Timeout after 2 seconds
      setTimeout(() => {
        subscription.unsubscribe();
        if (!authService.getCurrentUser()) {
          router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          resolve(false);
        }
      }, 2000);
    });
  }

  return true;
};
