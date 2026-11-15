import { Component, computed, inject } from '@angular/core';
import {
  IonAvatar, IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonContent, IonGrid, IonItem,
  IonList
} from '@ionic/angular';

import { SafeImageDirective } from 'src/app/directives/safe-image.directive';
import { RankingTabsService } from 'src/app/services/ranking-tabs.service';

@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.page.html',
  styleUrls: ['./asistencias.page.scss'],
  imports: [
    SafeImageDirective,
    IonAvatar, IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonContent, IonGrid, IonItem,
    IonList
  ],
})
export class AsistenciasPage {

  private readonly rankingTabsService = inject(RankingTabsService);

  readonly players = computed(() => [...this.rankingTabsService.players()].sort((a, b) => b.played - a.played));

  ionViewWillEnter() {
    this.rankingTabsService.tabsNavigation.set(true);
  }

}
