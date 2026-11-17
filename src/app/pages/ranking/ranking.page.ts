import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IonAvatar, IonButtons, IonContent, IonGrid, IonHeader, IonLabel, IonMenuButton, IonSegment,
  IonSegmentButton, IonTitle, IonToolbar
} from '@ionic/angular';

import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ScoreComponent } from 'src/app/components/score/score.component';
import { ScoreNumberComponent } from 'src/app/components/score-number/score-number.component';
import { SafeImageDirective } from 'src/app/directives/safe-image.directive';
import { MIN_GAMES_FOR_RANKING, playerScore } from 'src/app/helpers/score.helpers';
import { Player } from 'src/app/models/player.interface';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DbService } from 'src/app/services/db.service';

export type RankingCategory = 'general' | 'asistencias' | 'ganados';

/** Orden de cada categoría: mayor primero, y el segundo criterio desempata. */
const SORTERS: Record<RankingCategory, (a: Player, b: Player) => number> = {
  general: (a, b) => playerScore(b) - playerScore(a) || b.played - a.played,
  asistencias: (a, b) => b.played - a.played || b.won - a.won,
  ganados: (a, b) => b.won - a.won || a.played - b.played,
};

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.page.html',
  styleUrls: ['./ranking.page.scss'],
  imports: [
    BackButtonComponent, ScoreComponent, ScoreNumberComponent, SafeImageDirective,
    IonAvatar, IonButtons, IonContent, IonGrid, IonHeader, IonLabel, IonMenuButton, IonSegment,
    IonSegmentButton, IonTitle, IonToolbar
  ],
})
export class RankingPage {

  private readonly db = inject(DbService);

  readonly minGames = MIN_GAMES_FOR_RANKING;

  readonly category = signal<RankingCategory>('general');

  readonly me = toSignal(inject(AuthenticationService).player$, { initialValue: null });

  /** Jugadores del ranking (con 10 partidos o más), en vivo desde Firestore. */
  private readonly players = toSignal(this.db.getPlayers(), { initialValue: [] as Player[] });

  readonly sorted = computed(() => [...this.players()].sort(SORTERS[this.category()]));

  /** Podio en el orden en que se dibuja: 2º, 1º, 3º. */
  readonly podium = computed(() => {
    const [first, second, third] = this.sorted();
    return [
      { player: second, place: 2 },
      { player: first, place: 1 },
      { player: third, place: 3 },
    ].filter(spot => !!spot.player);
  });

  readonly rest = computed(() => this.sorted().slice(3));

  /** Si el jugador logueado todavía no entra al ranking, cuántos partidos le faltan. */
  readonly gamesToQualify = computed(() => {
    const me = this.me();
    return me && me.played < MIN_GAMES_FOR_RANKING ? MIN_GAMES_FOR_RANKING - me.played : 0;
  });

  setCategory(value: unknown) {
    if (value === 'general' || value === 'asistencias' || value === 'ganados') {
      this.category.set(value);
    }
  }

}
