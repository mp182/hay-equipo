import { Component, inject } from '@angular/core';
import {
  IonBackButton, IonButtons, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonGrid, IonHeader,
  IonIcon, IonItem, IonLabel, IonMenuButton, IonTabBar, IonTabButton, IonTabs, IonText, IonTitle, IonToolbar
} from '@ionic/angular';

import { RankingTabsService } from 'src/app/services/ranking-tabs.service';

@Component({
  selector: 'app-ranking-tabs',
  templateUrl: './ranking-tabs.page.html',
  styleUrls: ['./ranking-tabs.page.scss'],
  imports: [
    IonBackButton, IonButtons, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonGrid, IonHeader,
    IonIcon, IonItem, IonLabel, IonMenuButton, IonTabBar, IonTabButton, IonTabs, IonText, IonTitle, IonToolbar
  ],
})
export class RankingTabsPage {

  readonly rankingTabsService = inject(RankingTabsService);

  ionViewWillLeave() {
    this.rankingTabsService.tabsNavigation.set(false);
  }

}
