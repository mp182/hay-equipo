import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Observable, Subscription } from 'rxjs';
import { Match } from 'src/app/models/match.interface';
import { DbService } from 'src/app/services/db.service';
import { UpdatePage } from '../update/update.page';
import { LoadingService } from 'src/app/services/loading.service';
import { Player } from 'src/app/models/player.interface';
import { News } from 'src/app/models/news.interface';
import { take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  matches$: Observable<Match[]>;
  news$: Observable<News[]>;
  player: Player;
  player$: Observable<Player>;

  private localVersion: string;
  private subscription: Subscription = new Subscription();
  private updatesSearched = false;

  constructor(
    private authService: AuthenticationService,
    private dbService: DbService,
    private loadingService: LoadingService,
    private modalController: ModalController,
    private toastServiceService: ToastService
  ) { }

  ngOnInit(): void {
    this.localVersion = environment.version;

    this.player$ = this.authService.player$.pipe(
      tap(player => { this.player = player })
    );

    this.matches$ = this.dbService.getEnabledMatches().pipe(
      tap(matches => {
        matches.sort((a, b) => +new Date(a.date.toDate()) - +new Date(b.date.toDate()));
        matches = matches.map(match => {
          match.fullMatch = match.maxPlayers <= match.playersList?.length;
          match.playerOn = match.playersList?.some(x => x === this.player?.id);
          return match;
        });
      })
    );

    this.news$ = this.dbService.getCardNews();
  }

  ionViewWillEnter() {
    this.loadingService.showLoading();
  }

  ionViewDidEnter() {
    this.loadingService.hideLoading();
    this.searchForUpdates();
  }

  private searchForUpdates() {
    if (!this.updatesSearched) {
      this.toastServiceService.infoToast('Buscando actualizaciones...');
      this.updatesSearched = true;
      this.subscription.add(this.dbService.getVersion()
        .pipe(
          take(1)
        )
        .subscribe(async remoteVersion => {
          if (!!remoteVersion && this.localVersion !== remoteVersion) {
            const updateAppModal = await this.modalController.create({
              component: UpdatePage,
              backdropDismiss: false
            });
            await updateAppModal.present();
          }
        }));
    }
  }

}
