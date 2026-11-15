import { Injectable } from '@angular/core';
import { Observable, distinctUntilChanged, fromEvent, map, merge } from 'rxjs';

/** Reemplazo de `ng-connection-service`: avisa cuando se pierde o vuelve la conexión. */
@Injectable({ providedIn: 'root' })
export class ConnectionService {

  /** Emite `true`/`false` cada vez que cambia el estado de la conexión. */
  monitor(): Observable<boolean> {
    return merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).pipe(distinctUntilChanged());
  }

}
