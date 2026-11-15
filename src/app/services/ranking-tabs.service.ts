import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { Player } from '../models/player.interface';
import { DbService } from './db.service';

@Injectable({ providedIn: 'root' })
export class RankingTabsService {

  private readonly db = inject(DbService);

  /** Jugadores del ranking, en vivo desde Firestore. */
  readonly players = toSignal(this.db.getPlayers(), { initialValue: [] as Player[] });

  /** `true` cuando se está mirando alguna de las pestañas (oculta la tarjeta de ayuda). */
  readonly tabsNavigation = signal(false);

}
