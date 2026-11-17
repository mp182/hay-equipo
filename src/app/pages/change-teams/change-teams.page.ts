import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonItem, IonLabel, IonList, IonReorder,
  IonReorderGroup, IonTitle, IonToolbar, ReorderEndCustomEvent
} from '@ionic/angular';
import { Subscription, combineLatest } from 'rxjs';

import { Player } from 'src/app/models/player.interface';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';

/** Ítem de la lista reordenable: un jugador o un separador de equipo. */
type ReorderItem = (Player & { flag?: false }) | { nickname: string; flag: true; id: string };

const WHITE_FLAG: ReorderItem = { id: '__white', nickname: 'Remera blanca', flag: true };
const BLACK_FLAG: ReorderItem = { id: '__black', nickname: 'Remera negra', flag: true };

@Component({
  selector: 'app-change-teams',
  templateUrl: './change-teams.page.html',
  styleUrls: ['./change-teams.page.scss'],
  imports: [
    IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonItem, IonLabel, IonList, IonReorder,
    IonReorderGroup, IonTitle, IonToolbar
  ],
})
export class ChangeTeamsPage implements OnInit {

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly db = inject(DbService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly matchId = this.activatedRoute.snapshot.paramMap.get('id')!;

  /** Lista: [Remera Blanca, ...blancos, Remera Negra, ...negros]. */
  readonly reorderItems = signal<ReorderItem[]>([]);

  private teamWhite: Player[] = [];
  private teamBlack: Player[] = [];
  private subscription?: Subscription;

  ngOnInit() {
    this.listenTeams();
  }

  private listenTeams() {
    this.subscription = combineLatest([this.db.getTeamWhite(this.matchId), this.db.getTeamBlack(this.matchId)])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([teamWhite, teamBlack]) => {
        this.teamWhite = teamWhite;
        this.teamBlack = teamBlack;
        this.reorderItems.set([WHITE_FLAG, ...teamWhite, BLACK_FLAG, ...teamBlack]);
      });
  }

  /** Solo se puede guardar si los separadores siguen en su lugar (equipos del mismo tamaño). */
  canSave() {
    const items = this.reorderItems();
    return items.length > 0 && items[0] === WHITE_FLAG && items[this.teamWhite.length + 1] === BLACK_FLAG;
  }

  doReorder(ev: ReorderEndCustomEvent) {
    this.reorderItems.set(ev.detail.complete([...this.reorderItems()]));
  }

  async changeTeams() {
    this.subscription?.unsubscribe();

    const items = this.reorderItems();
    const blackIndex = items.indexOf(BLACK_FLAG);
    const newTeamWhite = items.slice(1, blackIndex) as Player[];
    const newTeamBlack = items.slice(blackIndex + 1) as Player[];

    const movedToWhite = newTeamWhite.filter(player => !this.teamWhite.some(p => p.id === player.id));
    const movedToBlack = newTeamBlack.filter(player => !this.teamBlack.some(p => p.id === player.id));

    await this.loadingService.showLoading();
    try {
      await this.db.moveBetweenTeams(this.matchId, movedToWhite, movedToBlack);
      await this.toastService.successToast('Se cambiaron los equipos!');
      await this.router.navigate(['/match', this.matchId]);
    } catch (err) {
      console.error(err);
      await this.toastService.errorToast();
      // Volvemos a escuchar los equipos para que la lista muestre lo que realmente quedó guardado.
      this.listenTeams();
    } finally {
      await this.loadingService.hideLoading();
    }
  }

}
