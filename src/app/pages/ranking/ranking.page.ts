import { Component, computed, inject } from '@angular/core';
import {
  IonAvatar, IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonContent, IonGrid, IonIcon, IonItem,
  IonList
} from '@ionic/angular';

import { ScoreComponent } from 'src/app/components/score/score.component';
import { SafeImageDirective } from 'src/app/directives/safe-image.directive';
import { RankingTabsService } from 'src/app/services/ranking-tabs.service';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.page.html',
  styleUrls: ['./ranking.page.scss'],
  imports: [
    ScoreComponent, SafeImageDirective,
    IonAvatar, IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonContent, IonGrid, IonIcon, IonItem,
    IonList
  ],
})
export class RankingPage {

  private readonly rankingTabsService = inject(RankingTabsService);

  /** Mejor promedio primero (solo jugadores con más de 10 partidos). */
  readonly players = computed(() => [...this.rankingTabsService.players()].sort((a, b) => {
    const scoreA = a.won === 0 ? 0 : (a.won / a.played) * 100;
    const scoreB = b.won === 0 ? 0 : (b.won / b.played) * 100;
    return scoreB - scoreA || b.played - a.played;
  }));

  ionViewWillEnter() {
    this.rankingTabsService.tabsNavigation.set(true);
  }

}
