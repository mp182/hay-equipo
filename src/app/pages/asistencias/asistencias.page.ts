import { Component } from '@angular/core';
import { Player } from 'src/app/models/player.interface';
import { LoadingService } from 'src/app/services/loading.service';
import { RankingTabsService } from 'src/app/services/ranking-tabs.service';

@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.page.html',
  styleUrls: ['./asistencias.page.scss'],
})
export class AsistenciasPage {

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

  orderByPlayed(players: Player[]): Player[] {
    if (players) {
      return players.sort((a: { played: number; }, b: { played: number; }) => {
        return b.played - a.played;
      });
    }
  }

}
