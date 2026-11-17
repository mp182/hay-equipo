import { Injectable } from '@angular/core';
import { Observable, defer, distinctUntilChanged, fromEvent, map, merge, of } from 'rxjs';

/** Reemplazo de `ng-connection-service`: avisa cuando se pierde o vuelve la conexión. */
@Injectable({ providedIn: 'root' })
export class ConnectionService {

  /**
   * Emite el estado de la conexión al suscribirse (por si la app se abre ya sin conexión)
   * y después `true`/`false` cada vez que cambia.
   */
  monitor(): Observable<boolean> {
    return merge(
      defer(() => of(navigator.onLine)),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).pipe(distinctUntilChanged());
  }

}
