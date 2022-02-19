import { Component } from '@angular/core';
import { Player } from 'src/app/models/player.interface';
import { LoadingService } from 'src/app/services/loading.service';
import { RankingTabsService } from 'src/app/services/ranking-tabs.service';

@Component({
  selector: 'app-ganados',
  templateUrl: './ganados.page.html',
  styleUrls: ['./ganados.page.scss'],
})
export class GanadosPage {

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

  orderByWon(players: Player[]): Player[] {
    if (players) {
      return players.sort((a: { won: number; }, b: { won: number; }) => {
        return b.won - a.won;
      });
    }
  }

}
