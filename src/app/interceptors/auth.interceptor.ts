import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const user = auth.currentUser;

  // If user is authenticated, add token to request
  if (user) {
    return from(user.getIdToken()).pipe(
      switchMap(token => {
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(clonedReq);
      })
    );
  }

  // If no user, proceed without token
  return next(req);
};
