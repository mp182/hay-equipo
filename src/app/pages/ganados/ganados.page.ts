import { Component, computed, inject } from '@angular/core';
import {
  IonAvatar, IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonContent, IonGrid, IonItem,
  IonList
} from '@ionic/angular';

import { SafeImageDirective } from 'src/app/directives/safe-image.directive';
import { RankingTabsService } from 'src/app/services/ranking-tabs.service';

@Component({
  selector: 'app-ganados',
  templateUrl: './ganados.page.html',
  styleUrls: ['./ganados.page.scss'],
  imports: [
    SafeImageDirective,
    IonAvatar, IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonContent, IonGrid, IonItem,
    IonList
  ],
})
export class GanadosPage {

  private readonly rankingTabsService = inject(RankingTabsService);

  readonly players = computed(() => [...this.rankingTabsService.players()].sort((a, b) => b.won - a.won));

  ionViewWillEnter() {
    this.rankingTabsService.tabsNavigation.set(true);
  }

}
