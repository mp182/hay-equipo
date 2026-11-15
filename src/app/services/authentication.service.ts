import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Auth, GoogleAuthProvider, User, getRedirectResult, signInWithPopup, signInWithRedirect, signOut, user
} from '@angular/fire/auth';
import { Firestore, doc, docData, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable, of, shareReplay, switchMap, map } from 'rxjs';

import { Player } from '../models/player.interface';
import { titleCase } from '../helpers/string.helpers';

export const DEFAULT_AVATAR = 'assets/img/playerAvatar.png';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);

  /** El jugador logueado (documento `users/{uid}`), o `null` si no hay sesión. */
  readonly player$: Observable<Player | null> = user(this.auth).pipe(
    switchMap(currentUser => {
      if (!currentUser) {
        return of(null);
      }
      return this.run(() => docData(doc(this.firestore, `users/${currentUser.uid}`))).pipe(
        map(data => ({ ...(data as Player), id: currentUser.uid }))
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  logoutUser() {
    return this.run(() => signOut(this.auth));
  }

  /** Usuario de Firebase Auth actual (espera a que Auth termine de inicializar). */
  async userDetails() {
    await this.auth.authStateReady();
    return this.auth.currentUser;
  }

  /** `true` si hay una sesión iniciada (espera a que Firebase Auth termine de inicializar). */
  async isLoggedIn(): Promise<boolean> {
    return !!(await this.userDetails());
  }

  /**
   * Ingreso con Google. Usa el popup y, si el navegador lo bloquea (pasa en la app instalada en iPhone),
   * redirige a la página de Google; al volver se completa con `completeRedirectLogin()`.
   * Devuelve `false` si redirigió (la página se va a recargar).
   */
  async loginWithGoogle(): Promise<boolean> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    if (this.popupsUnreliable()) {
      await this.run(() => signInWithRedirect(this.auth, provider));
      return false;
    }

    try {
      const credential = await this.run(() => signInWithPopup(this.auth, provider));
      await this.ensurePlayer(credential.user);
      return true;
    } catch (err: any) {
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-environment') {
        await this.run(() => signInWithRedirect(this.auth, provider));
        return false;
      }
      throw err;
    }
  }

  /** Si se volvió de la página de Google, termina el ingreso. Devuelve `true` si había un ingreso pendiente. */
  async completeRedirectLogin(): Promise<boolean> {
    const credential = await this.run(() => getRedirectResult(this.auth));
    if (!credential) {
      return false;
    }
    await this.ensurePlayer(credential.user);
    return true;
  }

  /** Crea el documento del jugador la primera vez que entra. */
  private async ensurePlayer(account: User) {
    const ref = this.run(() => doc(this.firestore, `users/${account.uid}`));
    const snapshot = await this.run(() => getDoc(ref));
    if (snapshot.exists()) {
      return;
    }
    await this.run(() => setDoc(ref, {
      nickname: titleCase(account.displayName?.split(' ')[0] ?? 'Jugador'),
      roles: ['player'],
      played: 0,
      won: 0,
      image: account.photoURL ?? DEFAULT_AVATAR,
      email: account.email,
      googleLogin: true
    }));
  }

  /** En la PWA instalada en iPhone/iPad los popups no son confiables: conviene ir directo a la redirección. */
  private popupsUnreliable(): boolean {
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return standalone && iOS;
  }

  saveFriendUser(player: Player, win: boolean) {
    return this.run(() => setDoc(doc(this.firestore, `users/${player.id}`), {
      nickname: titleCase(player.nickname),
      roles: ['player'],
      played: 1,
      won: win ? 1 : 0,
      image: DEFAULT_AVATAR,
      googleLogin: false,
      friend: true,
      lastGames: player.lastGames ?? []
    }));
  }

  /** AngularFire pide que las llamadas a Firebase se hagan dentro de un contexto de inyección. */
  private run<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }

}
