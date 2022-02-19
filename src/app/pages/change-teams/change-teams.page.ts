import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonReorderGroup } from '@ionic/angular';
import { ItemReorderEventDetail } from '@ionic/core';
import { combineLatest, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Player } from 'src/app/models/player.interface';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-change-teams',
  templateUrl: './change-teams.page.html',
  styleUrls: ['./change-teams.page.scss'],
})
export class ChangeTeamsPage implements OnInit, OnDestroy {

  matchId: string;
  remeraNegraIndex: number;
  reorderItems: any[];
  subscription: Subscription;
  teamBlack: Player[];
  teamWhite: Player[];

  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;

  constructor(
    private activatedRoute: ActivatedRoute,
    private db: DbService,
    private loadingService: LoadingService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadingService.showLoading();

    this.matchId = this.activatedRoute.snapshot.paramMap.get('id');

    this.subscription = combineLatest(
      [this.db.getTeamBlack(this.matchId), this.db.getTeamWhite(this.matchId)]
    ).pipe(
      tap(result => {
        this.teamBlack = result[0];
        this.teamWhite = result[1];
        this.reorderItems = this.teamWhite.concat(this.teamBlack);
        this.reorderItems.splice(0, 0, { nickname: '⚪ Remera Blanca ⚪', flag: true });
        this.remeraNegraIndex = ((this.teamBlack.length + this.teamWhite.length) / 2) + 1;
        this.reorderItems.splice(this.remeraNegraIndex, 0, { nickname: '⚫ Remera Negra ⚫', flag: true });
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  ionViewDidEnter() {
    this.loadingService.hideLoading();
  }

  doReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    this.reorderItems = ev.detail.complete(this.reorderItems);
  }

  changeTeams(): void {
    this.loadingService.showLoading();
    this.subscription.unsubscribe();

    let newTeamWhite = this.reorderItems.slice(1, this.teamBlack.length + 1);
    let newTeamBlack = this.reorderItems.slice(this.teamBlack.length + 2, this.reorderItems.length);

    let teamWhitePlayersToAdd = [];

    newTeamWhite.forEach(player => {
      if (!this.teamWhite.some(x => x.id === player.id)) {
        teamWhitePlayersToAdd.push(player);
      }
    });

    let teamBlackPlayersToAdd = [];

    newTeamBlack.forEach(player => {
      if (!this.teamBlack.some(x => x.id === player.id)) {
        teamBlackPlayersToAdd.push(player);
      }
    });

    let promises: Promise<void>[] = [];

    teamWhitePlayersToAdd.forEach(player => {
      promises.push(this.db.deleteFromTeam(player.id, this.matchId, 'teamBlack'));
      promises.push(this.db.addToTeam(player, this.matchId, 'teamWhite'));
    });

    teamBlackPlayersToAdd.forEach(player => {
      promises.push(this.db.deleteFromTeam(player.id, this.matchId, 'teamWhite'));
      promises.push(this.db.addToTeam(player, this.matchId, 'teamBlack'));
    });

    Promise.all(promises).finally(() => {
      this.router.navigate(['/match', this.matchId]);
      this.toastService.successToast('Se cambiaron los equipos!');
    });
  }

}
