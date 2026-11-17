import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, take } from 'rxjs';

import { AdminRole, hasAdminRole } from '../helpers/roles.helpers';
import { AuthenticationService } from '../services/authentication.service';

/** Deja pasar solo a usuarios logueados; si no, redirige al login. */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return user(inject(Auth)).pipe(
    take(1),
    map(currentUser => currentUser ? true : router.createUrlTree(['login']))
  );
};

/**
 * Deja pasar solo a los admins (ver `hasAdminRole`: sin rol, admins y superadmins; con un rol, solo ese).
 * A los demás los manda al dashboard. Va después de `authGuard`: las reglas de Firestore igual rechazan
 * lo que intente un jugador común, esto es para que no vea pantallas que no puede usar.
 */
export function adminGuard(role?: AdminRole): CanActivateFn {
  return () => {
    const router = inject(Router);
    return inject(AuthenticationService).player$.pipe(
      take(1),
      map(player => hasAdminRole(player, role) ? true : router.createUrlTree(['dashboard']))
    );
  };
}
