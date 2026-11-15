import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, take } from 'rxjs';

/** Deja pasar solo a usuarios logueados; si no, redirige al login. */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return user(inject(Auth)).pipe(
    take(1),
    map(currentUser => currentUser ? true : router.createUrlTree(['login']))
  );
};
