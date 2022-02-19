import { Component } from '@angular/core';
import { RankingTabsService } from 'src/app/services/ranking-tabs.service';

@Component({
  selector: 'app-ranking-tabs',
  templateUrl: './ranking-tabs.page.html',
  styleUrls: ['./ranking-tabs.page.scss'],
})
export class RankingTabsPage {

  constructor(
    public rankingTabsService: RankingTabsService
  ) { }

  ionViewWillLeave() {
    if (this.rankingTabsService.playersSubscription) { this.rankingTabsService.playersSubscription.unsubscribe(); }
    this.rankingTabsService.tabsNavigation = false;
  }

}
