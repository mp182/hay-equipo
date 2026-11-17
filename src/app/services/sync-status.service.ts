import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { Observable, distinctUntilChanged, of, shareReplay, switchMap } from 'rxjs';

/**
 * Si lo que muestra la app está confirmado con el servidor de Firestore.
 *
 * El navegador puede creer que hay conexión cuando no llega nada (un Wi-Fi sin internet, poca señal):
 * ahí Firestore sigue mostrando los datos guardados en el teléfono y no salta el evento `offline`.
 * Firestore sí sabe si los datos vienen del servidor o de la caché (`metadata.fromCache`): se escucha
 * el documento del jugador logueado, que siempre se está leyendo, y se avisa cuando queda sin confirmar.
 */
@Injectable({ providedIn: 'root' })
export class SyncStatusService {

  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);

  /** `true` mientras Firestore no puede confirmar los datos con el servidor. Sin sesión, `false`. */
  readonly stale$: Observable<boolean> = user(this.auth).pipe(
    switchMap(currentUser => currentUser ? this.fromCache(`users/${currentUser.uid}`) : of(false)),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private fromCache(path: string): Observable<boolean> {
    return new Observable<boolean>(subscriber => this.run(() => onSnapshot(
      doc(this.firestore, path),
      // Con los cambios de metadata, Firestore avisa también cuando solo cambia de dónde vienen los datos.
      { includeMetadataChanges: true },
      {
        next: snapshot => subscriber.next(snapshot.metadata.fromCache),
        // Un error (por ejemplo, al cerrar sesión) no es "sin conexión": no se avisa.
        error: () => subscriber.next(false)
      }
    )));
  }

  /** AngularFire pide que las llamadas a Firebase se hagan dentro de un contexto de inyección. */
  private run<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }

}
