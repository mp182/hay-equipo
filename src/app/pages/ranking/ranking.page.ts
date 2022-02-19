import { Component } from '@angular/core';
import { Player } from 'src/app/models/player.interface';
import { LoadingService } from 'src/app/services/loading.service';
import { RankingTabsService } from 'src/app/services/ranking-tabs.service';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.page.html',
  styleUrls: ['./ranking.page.scss'],
})
export class RankingPage {

  players: Player[];

  constructor(
    private loadingService: LoadingService,
    private rankingTabsService: RankingTabsService
  ) { }

  ionViewWillEnter() {
    this.loadingService.showLoading();

    this.players = this.rankingTabsService.players;

    this.rankingTabsService.tabsNavigation = true;
  }

  ionViewDidEnter() {
    this.loadingService.hideLoading();
  }

  orderByScore(players: Player[]): Player[] {
    if (players) {
      return players.sort((a: { won: number; played: number; }, b: { won: number; played: number; }) => {
        const scoreA = a.won === 0 ? 0 : (a.won / a.played) * 100;
        const scoreB = b.won === 0 ? 0 : (b.won / b.played) * 100;
        return scoreB === scoreA ? scoreB + 1 - scoreA : scoreB - scoreA;
      });
    }
  }

}
