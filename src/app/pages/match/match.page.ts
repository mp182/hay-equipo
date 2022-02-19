import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Match } from 'src/app/models/match.interface';
import { Player } from 'src/app/models/player.interface';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.page.html',
  styleUrls: ['./match.page.scss'],
})
export class MatchPage implements OnInit, OnDestroy {

  alertPresent = false;
  fullMatch = false;
  matchId: string;
  match: Match;
  match$: Observable<Match>;
  matchOver = false;
  player: Player;
  player$: Observable<Player>;
  players: Player[];
  players$: Observable<Player[]>;
  subscribed = false;
  subscription: Subscription;
  teamWhite: Player[];
  teamWhiteSubscription: Subscription;
  teamBlack: Player[];
  teamBlackSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private authService: AuthenticationService,
    private db: DbService,
    private loadingService: LoadingService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadingService.showLoading();

    this.matchId = this.activatedRoute.snapshot.paramMap.get('id');
    this.match$ = this.db.getMatch(this.matchId);
    this.player$ = this.authService.player$;
    this.players$ = this.db.getSubscribers(this.matchId).pipe(
      tap(players => {
        players.sort((a, b) => {
          const scoreA = a.played < 10 ? 50
            : a.played >= 10 && a.won === 0 ? 0
              : (a.won / a.played) * 100;
          const scoreB = b.played < 10 ? 50
            : b.played >= 10 && b.won === 0 ? 0
              : (b.won / b.played) * 100;
          return scoreB - scoreA;
        });
      })
    );

    this.teamBlackSubscription = this.db.getTeamBlack(this.matchId).subscribe(team => {
      this.teamBlack = team;
      this.teamBlack.sort((a, b) => {
        const scoreA = a.played < 10 ? 50
          : a.played >= 10 && a.won === 0 ? 0
            : (a.won / a.played) * 100;
        const scoreB = b.played < 10 ? 50
          : b.played >= 10 && b.won === 0 ? 0
            : (b.won / b.played) * 100;
        return scoreB - scoreA;
      });
    });

    this.teamWhiteSubscription = this.db.getTeamWhite(this.matchId).subscribe(team => {
      this.teamWhite = team;
      this.teamWhite.sort((a, b) => {
        const scoreA = a.played < 10 ? 50
          : a.played >= 10 && a.won === 0 ? 0
            : (a.won / a.played) * 100;
        const scoreB = b.played < 10 ? 50
          : b.played >= 10 && b.won === 0 ? 0
            : (b.won / b.played) * 100;
        return scoreB - scoreA;
      });
    });

    this.subscription = combineLatest([this.player$, this.players$, this.match$]).pipe(
      map(result => {
        this.player = result[0];
        this.players = result[1];
        this.match = result[2];

        this.matchOver = new Date() > this.match.date.toDate().setHours(this.match.date.toDate().getHours() + 1);
        this.fullMatch = this.match.playersList?.length === +this.match.maxPlayers;
        this.subscribed = this.match.playersList?.some(x => x === this.player?.id);
      })
    ).subscribe();

  }

  ionViewDidEnter() {
    this.loadingService.hideLoading();
  }

  ionViewWillLeave() {
    if (this.alertPresent) { this.alertController.dismiss(); }
  }

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  addFriend() {
    this.router.navigate(['add-friend', this.matchId]);
  }

  async unsubscribeAlert() {
    const alert = await this.alertController.create({
      backdropDismiss: false,
      header: 'No vas a jugar?',
      message: 'Te bajas del partido?',
      mode: 'ios',
      buttons: [
        {
          text: 'Me quedo 💪',
          role: 'cancel',
          handler: () => {
            this.alertPresent = false;
          }
        }, {
          text: 'Me bajo 😔',
          handler: () => {
            this.loadingService.showLoading();
            Promise.all(this.unsubscribe(this.player.id, this.matchId))
              .then(() => {
                this.alertPresent = false;
                this.loadingService.hideLoading();
                this.router.navigateByUrl('dashboard');
              })
              .catch(async () => {
                this.alertPresent = false;
                this.toastService.errorToast();
                this.loadingService.hideLoading();
              });
          }
        }
      ]
    });

    await alert.present().then(() => this.alertPresent = true);
  }

  unsubscribe(playerId: string, matchId: string) {
    return this.db.unsubscribe(playerId, matchId);
  }

  teams() {
    this.players = this.players.sort((a, b) => {
      const scoreA = a.played < 10 || a.won === 0 ? 50 : (a.won / a.played) * 100;
      const scoreB = b.played < 10 || b.won === 0 ? 50 : (b.won / b.played) * 100;
      return scoreB - scoreA;
    });

    if (this.players.length === 12) {
      this.teamWhite.push(this.players[0]);
      this.teamWhite.push(this.players[11]);
      this.teamWhite.push(this.players[2]);
      this.teamWhite.push(this.players[9]);
      this.teamWhite.push(this.players[4]);
      this.teamWhite.push(this.players[7]);

      this.teamBlack.push(this.players[1]);
      this.teamBlack.push(this.players[10]);
      this.teamBlack.push(this.players[3]);
      this.teamBlack.push(this.players[8]);
      this.teamBlack.push(this.players[5]);
      this.teamBlack.push(this.players[6]);
    }

    if (this.players.length === 10) {
      this.teamWhite.push(this.players[0]);
      this.teamWhite.push(this.players[9]);
      this.teamWhite.push(this.players[2]);
      this.teamWhite.push(this.players[7]);
      this.teamWhite.push(this.players[4]);

      this.teamBlack.push(this.players[1]);
      this.teamBlack.push(this.players[8]);
      this.teamBlack.push(this.players[3]);
      this.teamBlack.push(this.players[6]);
      this.teamBlack.push(this.players[5]);
    }

    this.db.setTeams(this.matchId, this.teamWhite, this.teamBlack);
  }

  async theWinnerIs() {
    let alert: HTMLIonAlertElement;
    alert = await this.alertController.create({
      backdropDismiss: false,
      header: 'El ganador es...',
      message: '¿Quién ganó?',
      buttons: [
        this.teamBlackButton,
        this.teamWhiteButton
      ]
    });

    await alert.present().then(() => this.alertPresent = true);
  }

  async joinMatch(player: Player, matchId: string) {
    this.loadingService.showLoading();
    Promise.all(await this.db.joinMatch(player, matchId))
      .then(() => {
        this.loadingService.hideLoading();
        this.toastService.successToast('Anotado! 🤜🤛');
      })
      .catch(() => {
        this.loadingService.hideLoading();
        this.toastService.errorToast();
      });
  }

  async deleteFriend(orderedPlayer: any) {
    const alert = await this.alertController.create({
      backdropDismiss: false,
      header: 'Eliminar amigo?',
      message: `Borrar a ${orderedPlayer.nickname}?`,
      buttons: [
        {
          text: 'No, le erré!',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.alertPresent = false;
          }
        }, {
          text: 'Si, ya fue!',
          handler: () => {
            this.loadingService.showLoading();
            Promise.all(this.unsubscribe(orderedPlayer.id, this.matchId))
              .then(() => {
                this.alertPresent = false;
                this.loadingService.hideLoading();
                this.toastService.successToast('Amigo eliminado!');
              })
              .catch(async () => {
                this.alertPresent = false;
                this.toastService.errorToast();
                this.loadingService.hideLoading();
              });
          }
        }
      ]
    });

    await alert.present().then(() => this.alertPresent = true);
  }

  async suspendedMatch() {
    let alert: HTMLIonAlertElement;
    alert = await this.alertController.create({
      backdropDismiss: false,
      header: 'Se suspendió?',
      message: 'Este partido no cuenta...',
      buttons: [
        this.matchSuspendedButton
      ]
    });

    await alert.present().then(() => this.alertPresent = true);
  }

  private readonly matchSuspendedButton = {
    text: 'Suspendido 😥',
    handler: async () => {
      const alertMatchSuspended = await this.alertController.create({
        backdropDismiss: false,
        header: 'Partido Suspendido!',
        message: '¿Seguro...?',
        buttons: [
          {
            text: 'No, le erré 👎',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              this.alertPresent = false;
            }
          }, {
            text: 'Si 😀',
            handler: () => {
              this.loadingService.showLoading();
              this.db.updateMatch(this.matchId)
                .then(() => {
                  this.alertPresent = false;
                  this.loadingService.hideLoading();
                  this.router.navigateByUrl('dashboard');
                })
                .catch(() => {
                  this.alertPresent = false;
                  this.toastService.errorToast();
                  this.loadingService.hideLoading();
                });
            }
          }
        ]
      });
      alertMatchSuspended.present().then(() => this.alertPresent = true);
    }
  };

  private readonly teamWhiteButton = {
    text: 'Remera Blanca 🏳️',
    handler: async () => {
      const alertWhite = await this.alertController.create({
        backdropDismiss: false,
        header: 'Remera Blanca!',
        message: '¿Seguro...?',
        buttons: [
          {
            text: 'No, le erré 👎',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              this.alertPresent = false;
            }
          }, {
            text: 'Si 😀',
            handler: () => {
              this.loadingService.showLoading();
              this.db.setWinner(this.matchId, 'white', this.teamWhite, this.teamBlack)
                .then(() => {
                  this.alertPresent = false;
                  this.loadingService.hideLoading();
                  this.router.navigateByUrl('dashboard');
                })
                .catch(() => {
                  this.alertPresent = false;
                  this.toastService.errorToast();
                  this.loadingService.hideLoading();
                });
            }
          }
        ]
      });
      alertWhite.present().then(() => this.alertPresent = true);
    }
  };

  private readonly teamBlackButton = {
    text: 'Remera Negra 🏴',
    handler: async () => {
      const alertBlack = await this.alertController.create({
        backdropDismiss: false,
        header: 'Remera Negra!',
        message: '¿Seguro...?',
        buttons: [
          {
            text: 'No, le erré 👎',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              this.alertPresent = false;
            }
          }, {
            text: 'Si 😀',
            handler: () => {
              this.loadingService.showLoading();
              this.db.setWinner(this.matchId, 'black', this.teamWhite, this.teamBlack)
                .then(() => {
                  this.alertPresent = false;
                  this.loadingService.hideLoading();
                  this.router.navigateByUrl('dashboard');
                })
                .catch(() => {
                  this.alertPresent = false;
                  this.toastService.errorToast();
                  this.loadingService.hideLoading();
                });
            }
          }
        ]
      });
      alertBlack.present().then(() => this.alertPresent = true);
    }
  };

}
