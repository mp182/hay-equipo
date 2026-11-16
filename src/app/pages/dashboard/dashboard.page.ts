import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonAvatar, IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonFab,
  IonFabButton, IonFabList, IonGrid, IonHeader, IonIcon, IonLabel, IonMenuButton, IonTitle, IonToolbar, ModalController
} from '@ionic/angular';
import { combineLatest, map, take } from 'rxjs';

import { ScoreComponent } from 'src/app/components/score/score.component';
import { NewsCardComponent } from 'src/app/components/news-card/news-card.component';
import { SafeImageDirective } from 'src/app/directives/safe-image.directive';
import { hasAdminRole } from 'src/app/helpers/roles.helpers';
import { Match } from 'src/app/models/match.interface';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DbService } from 'src/app/services/db.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
import { UpdatePage } from '../update/update.page';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    AsyncPipe, DatePipe, RouterLink, NewsCardComponent, SafeImageDirective, ScoreComponent,
    IonAvatar, IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonFab,
    IonFabButton, IonFabList, IonGrid, IonHeader, IonIcon, IonLabel, IonMenuButton, IonTitle, IonToolbar
  ],
})
export class DashboardPage {

  private readonly authService = inject(AuthenticationService);
  private readonly dbService = inject(DbService);
  private readonly modalController = inject(ModalController);
  private readonly toastService = inject(ToastService);

  private updatesSearched = false;

  /** Índices de los últimos 5 partidos. */
  readonly lastGamesSlots = [0, 1, 2, 3, 4];

  readonly player$ = this.authService.player$;

  /** El mismo chequeo que las reglas de Firestore: admins y superadmins (o solo el rol pedido). */
  readonly hasAdminRole = hasAdminRole;

  /** Partidos habilitados, ordenados por fecha y con el estado del jugador logueado. */
  readonly matches$ = combineLatest([this.dbService.getEnabledMatches(), this.player$]).pipe(
    map(([matches, player]) => matches
      .map((match): Match => ({
        ...match,
        fullMatch: match.maxPlayers <= (match.playersList?.length ?? 0),
        playerOn: !!player && (match.playersList ?? []).includes(player.id)
      }))
      .sort((a, b) => a.date.toMillis() - b.date.toMillis())
    )
  );

  readonly news$ = this.dbService.getCardNews();

  ionViewDidEnter() {
    this.searchForUpdates();
  }

  /** Si la versión publicada en Firestore es distinta a la local, ofrece actualizar. */
  private searchForUpdates() {
    if (this.updatesSearched) {
      return;
    }
    this.updatesSearched = true;
    this.toastService.infoToast('Buscando actualizaciones...');
    this.dbService.getVersion().pipe(take(1)).subscribe(async remoteVersion => {
      if (remoteVersion && environment.version !== remoteVersion) {
        const updateAppModal = await this.modalController.create({
          component: UpdatePage,
          backdropDismiss: false
        });
        await updateAppModal.present();
      }
    });
  }

}
