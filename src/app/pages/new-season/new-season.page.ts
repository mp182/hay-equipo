import { Component } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';
import { DbService } from 'src/app/services/db.service';
import { Player } from 'src/app/models/player.interface';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-season',
  templateUrl: './new-season.page.html',
  styleUrls: ['./new-season.page.scss'],
})
export class NewSeasonPage {

  players: Player[];
  playersSubscription: Subscription;

  constructor(
    private db: DbService,
    private loadingService: LoadingService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ionViewWillEnter() {
    this.loadingService.showLoading();

    this.playersSubscription = this.db.getAllPlayers().subscribe(players => {
      if (players) {
        this.players = players;
      }
    });
  }

  ionViewDidEnter() {
    this.loadingService.hideLoading();
  }

  ionViewWillLeave() {
    if (this.playersSubscription) { this.playersSubscription.unsubscribe(); }
  }

  newSeason() {
    this.loadingService.showLoading();
    this.db.startNewSeason(this.players);
    this.router.navigateByUrl('dashboard');
    this.toastService.successToast('Nueva Temporada 🔃✔');
    this.loadingService.hideLoading();
  }

}
