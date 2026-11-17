import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AlertButton, AlertController, IonAvatar, IonButton, IonButtons, IonContent, IonFooter, IonGrid,
  IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenuButton, IonTitle, IonToolbar
} from '@ionic/angular';
import { NavigationHistoryService } from 'src/app/services/navigation-history.service';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { combineLatest, interval, map } from 'rxjs';

import { ScoreComponent } from 'src/app/components/score/score.component';
import { ScoreNumberComponent } from 'src/app/components/score-number/score-number.component';
import { SafeImageDirective } from 'src/app/directives/safe-image.directive';
import { playerScore, sortByScore } from 'src/app/helpers/score.helpers';
import { Match } from 'src/app/models/match.interface';
import { Player } from 'src/app/models/player.interface';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AdminRole, hasAdminRole } from 'src/app/helpers/roles.helpers';
import { teamsOutOfDate } from 'src/app/helpers/teams.helpers';
import { DbService, MatchClosedError, MatchFullError, TeamsOutOfDateError } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';

/** Cuánto dura un partido: pasado ese tiempo desde la hora de inicio, se puede cargar el resultado. */
const MATCH_DURATION = 60 * 60 * 1000;

@Component({
  selector: 'app-match',
  templateUrl: './match.page.html',
  styleUrls: ['./match.page.scss'],
  imports: [
    BackButtonComponent, DatePipe, DecimalPipe, RouterLink, SafeImageDirective, ScoreComponent, ScoreNumberComponent,
    IonAvatar, IonButton, IonButtons, IonContent, IonFooter, IonGrid, IonHeader, IonIcon, IonItem,
    IonLabel, IonList, IonMenuButton, IonTitle, IonToolbar
  ],
})
export class MatchPage implements OnInit {

  private readonly history = inject(NavigationHistoryService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly alertController = inject(AlertController);
  private readonly authService = inject(AuthenticationService);
  private readonly db = inject(DbService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly matchId = this.activatedRoute.snapshot.paramMap.get('id')!;

  readonly player = signal<Player | null>(null);
  readonly match = signal<Match | null>(null);
  readonly players = signal<Player[]>([]);
  readonly teamWhite = signal<Player[]>([]);
  readonly teamBlack = signal<Player[]>([]);

  readonly hasTeams = computed(() => this.teamWhite().length + this.teamBlack().length > 0);
  /** Los equipos armados ya no son los anotados (alguien se bajó o entró después): hay que volver a armarlos. */
  readonly teamsOutdated = computed(() =>
    this.hasTeams() && teamsOutOfDate(this.match()?.playersList ?? [], this.teamWhite(), this.teamBlack()));

  /** Hora actual, refrescada cada minuto: así el partido pasa a terminado aunque la pantalla quede abierta. */
  private readonly now = signal(Date.now());

  /** El partido se considera terminado una hora después de empezar. */
  readonly matchOver = computed(() => {
    const match = this.match();
    return !!match && this.now() > match.date.toDate().getTime() + MATCH_DURATION;
  });

  readonly fullMatch = signal(false);
  readonly subscribed = signal(false);

  /** Promedio de cada equipo, para ver de un vistazo si quedaron parejos. */
  readonly teamWhiteAvg = computed(() => teamAverage(this.teamWhite()));
  readonly teamBlackAvg = computed(() => teamAverage(this.teamBlack()));

  /** Lugares libres (nunca negativo). */
  readonly spotsLeft = computed(() => Math.max(0, (this.match()?.maxPlayers ?? 0) - this.players().length));

  /** Si el admin tiene alguna acción disponible (si no, no se muestra la sección vacía). */
  readonly showAdminPanel = computed(() =>
    this.teamsOutdated() || this.matchOver() || (this.fullMatch() && !this.matchOver()));

  private alert?: HTMLIonAlertElement;

  ngOnInit() {
    interval(60 * 1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.now.set(Date.now()));

    this.db.getTeamBlack(this.matchId)
      .pipe(map(sortByScore), takeUntilDestroyed(this.destroyRef))
      .subscribe(team => this.teamBlack.set(team));

    this.db.getTeamWhite(this.matchId)
      .pipe(map(sortByScore), takeUntilDestroyed(this.destroyRef))
      .subscribe(team => this.teamWhite.set(team));

    combineLatest([
      this.authService.player$,
      this.db.getSubscribers(this.matchId).pipe(map(sortByScore)),
      this.db.getMatch(this.matchId)
    ]).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([player, players, match]) => {
        this.player.set(player);
        this.players.set(players);
        this.match.set(match ?? null);

        if (match) {
          this.fullMatch.set((match.playersList?.length ?? 0) >= +match.maxPlayers);
          this.subscribed.set(!!player && (match.playersList ?? []).includes(player.id));
        }
      });
  }

  ionViewWillLeave() {
    this.alert?.dismiss();
  }

  /** Ver `hasAdminRole`: sin rol, admins y superadmins; con un rol, solo ese. */
  isAdmin(role?: AdminRole) {
    return hasAdminRole(this.player(), role);
  }

  /**
   * Quién ve la ✕ para bajar a un anotado: los admins pueden bajar a cualquiera;
   * los demás, solo a los amigos que anotaron y mientras no haya equipos armados (como "No voy a jugar"),
   * porque solo los admins pueden sacarlos también de los equipos. Uno mismo se baja con "Me bajo".
   */
  canRemove(subscriber: Player) {
    const me = this.player()?.id;
    if (subscriber.id === me) {
      return false;
    }
    return this.isAdmin() || (!this.hasTeams() && !!subscriber.friendOf && subscriber.friendOf === me);
  }

  addFriend() {
    this.router.navigate(['add-friend', this.matchId]);
  }

  async joinMatch() {
    const player = this.player();
    if (!player) {
      return;
    }
    await this.withLoading(() => this.db.joinMatch(player, this.matchId), 'Anotado! 🤜🤛');
  }

  unsubscribeAlert() {
    return this.confirm('No vas a jugar?', 'Te bajas del partido?', 'Me quedo 💪', 'Me bajo 😔', async () => {
      if (await this.withLoading(() => this.db.unsubscribe(this.player()!.id, this.matchId))) {
        await this.history.backTo('/dashboard');
      }
    }, 'ios');
  }

  removeSubscriber(subscriber: Player) {
    const isMyFriend = !!subscriber.friendOf && subscriber.friendOf === this.player()?.id;
    const [header, done] = isMyFriend
      ? ['Eliminar amigo?', 'Amigo eliminado!']
      : ['Bajar del partido?', `${subscriber.nickname} ya no está anotado.`];
    return this.confirm(header, `Bajar a ${subscriber.nickname}?`, 'No, le erré!', 'Si, ya fue!',
      () => this.withLoading(() => this.db.unsubscribe(subscriber.id, this.matchId, this.isAdmin()), done));
  }

  /** Arma los equipos de forma pareja intercalando a los jugadores según su promedio. */
  async teams() {
    const players = sortByScore(this.players());

    const picks: Record<number, { white: number[]; black: number[] }> = {
      12: { white: [0, 11, 2, 9, 4, 7], black: [1, 10, 3, 8, 5, 6] },
      10: { white: [0, 9, 2, 7, 4], black: [1, 8, 3, 6, 5] },
    };
    const pick = picks[players.length];
    if (!pick) {
      await this.toastService.infoToast('Se necesitan 10 o 12 jugadores para armar los equipos.');
      return;
    }

    await this.withLoading(() => this.db.setTeams(
      this.matchId,
      pick.white.map(i => players[i]),
      pick.black.map(i => players[i])
    ));
  }

  async theWinnerIs() {
    if (this.teamsOutdated()) {
      await this.toastService.infoToast('Los equipos no coinciden con los anotados. Volvé a armarlos.');
      return;
    }
    await this.showAlert({
      header: 'El ganador es...',
      message: '¿Quién ganó?',
      buttons: [this.winnerButton('black'), this.winnerButton('white')]
    });
  }

  async suspendedMatch() {
    await this.showAlert({
      header: 'Se suspendió?',
      message: 'Este partido no cuenta...',
      buttons: [{
        text: 'Suspendido 😥',
        handler: () => {
          this.confirm('Partido Suspendido!', '¿Seguro...?', 'No, le erré 👎', 'Si 😀', async () => {
            if (await this.withLoading(() => this.db.updateMatch(this.matchId))) {
              await this.history.backTo('/dashboard');
            }
          });
        }
      }]
    });
  }

  private winnerButton(team: 'white' | 'black'): AlertButton {
    const name = team === 'white' ? 'Remera Blanca' : 'Remera Negra';
    return {
      text: team === 'white' ? `${name} 🏳️` : `${name} 🏴`,
      handler: () => {
        this.confirm(`${name}!`, '¿Seguro...?', 'No, le erré 👎', 'Si 😀', async () => {
          if (await this.withLoading(() => this.db.setWinner(this.matchId, team, this.teamWhite(), this.teamBlack()))) {
            await this.history.backTo('/dashboard');
          }
        });
      }
    };
  }

  private confirm(
    header: string, message: string, cancelText: string, okText: string, onOk: () => Promise<unknown>, mode?: 'ios'
  ) {
    return this.showAlert({
      header,
      message,
      mode,
      buttons: [
        { text: cancelText, role: 'cancel', cssClass: 'secondary' },
        { text: okText, handler: () => { onOk(); } }
      ]
    });
  }

  private async showAlert(options: Parameters<AlertController['create']>[0]) {
    this.alert = await this.alertController.create({ backdropDismiss: false, ...options });
    await this.alert.present();
  }

  /** Ejecuta la acción mostrando el loader y un toast de error si falla. Devuelve si salió bien. */
  private async withLoading(action: () => Promise<unknown>, successMessage?: string): Promise<boolean> {
    await this.loadingService.showLoading();
    try {
      await action();
      if (successMessage) {
        await this.toastService.successToast(successMessage);
      }
      return true;
    } catch (err) {
      if (err instanceof MatchFullError) {
        await this.toastService.infoToast('Uy, el partido se llenó justo! No quedan lugares.');
      } else if (err instanceof MatchClosedError) {
        await this.toastService.infoToast('Este partido ya estaba cerrado.');
      } else if (err instanceof TeamsOutOfDateError) {
        await this.toastService.infoToast('Los equipos no coinciden con los anotados. Volvé a armarlos.');
      } else {
        console.error(err);
        await this.toastService.errorToast();
      }
      return false;
    } finally {
      await this.loadingService.hideLoading();
    }
  }

}

function teamAverage(team: Player[]): number {
  return team.length ? team.reduce((sum, player) => sum + playerScore(player), 0) / team.length : 0;
}
