import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Auth, GoogleAuthProvider, UserCredential, createUserWithEmailAndPassword, getAdditionalUserInfo,
  sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, user
} from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Observable, of, shareReplay, switchMap, map } from 'rxjs';

import { Player } from '../models/player.interface';
import { LoadingService } from './loading.service';
import { titleCase } from '../helpers/string.helpers';

export const DEFAULT_AVATAR = 'assets/img/playerAvatar.png';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);
  private readonly loadingService = inject(LoadingService);

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

  async registerUser(value: { email: string; password: string; nickname: string; }): Promise<UserCredential> {
    await this.loadingService.showLoading();
    try {
      const credential = await this.run(() => createUserWithEmailAndPassword(this.auth, value.email, value.password));
      await this.run(() => setDoc(doc(this.firestore, `users/${credential.user.uid}`), {
        nickname: titleCase(value.nickname),
        roles: ['player'],
        played: 0,
        won: 0,
        image: DEFAULT_AVATAR,
        email: value.email,
        googleLogin: false,
      }));
      return credential;
    } finally {
      await this.loadingService.hideLoading();
    }
  }

  loginUser(value: { email: string; password: string; }) {
    return this.run(() => signInWithEmailAndPassword(this.auth, value.email, value.password));
  }

  logoutUser() {
    return this.run(() => signOut(this.auth));
  }

  /** Usuario de Firebase Auth actual (espera a que Auth termine de inicializar). */
  async userDetails() {
    await this.auth.authStateReady();
    return this.auth.currentUser;
  }

  resetPassword(value: { email: string; }) {
    return this.run(() => sendPasswordResetEmail(this.auth, value.email));
  }

  async loginWithGoogle() {
    const credential = await this.run(() => signInWithPopup(this.auth, new GoogleAuthProvider()));
    if (getAdditionalUserInfo(credential)?.isNewUser) {
      await this.run(() => setDoc(doc(this.firestore, `users/${credential.user.uid}`), {
        nickname: titleCase(credential.user.displayName?.split(' ')[0] ?? 'Jugador'),
        roles: ['player'],
        played: 0,
        won: 0,
        image: credential.user.photoURL ?? DEFAULT_AVATAR,
        email: credential.user.email,
        googleLogin: true
      }));
    }
    return credential;
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
