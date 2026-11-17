import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController, IonAvatar, IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonItem,
  IonLabel, IonList, IonMenuButton, IonSearchbar, IonTitle, IonToolbar, ModalController, SearchbarCustomEvent
} from '@ionic/angular';
import { combineLatest, map } from 'rxjs';

import { ScoreComponent } from 'src/app/components/score/score.component';
import { SafeImageDirective } from 'src/app/directives/safe-image.directive';
import { Player } from 'src/app/models/player.interface';
import { DbService, MatchFullError } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { AddNewFriendPage } from '../add-new-friend/add-new-friend.page';

@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.page.html',
  styleUrls: ['./add-friend.page.scss'],
  imports: [
    SafeImageDirective, ScoreComponent,
    IonAvatar, IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonLabel,
    IonList, IonMenuButton, IonSearchbar, IonTitle, IonToolbar
  ],
})
export class AddFriendPage {

  private readonly alertController = inject(AlertController);
  private readonly dbService = inject(DbService);
  private readonly loadingService = inject(LoadingService);
  private readonly modalController = inject(ModalController);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly matchId = inject(ActivatedRoute).snapshot.paramMap.get('id')!;

  /** Amigos que todavía no están anotados en este partido, ordenados por apodo. */
  private readonly friends = toSignal(
    combineLatest([this.dbService.getSubscribers(this.matchId), this.dbService.getFriends()]).pipe(
      map(([subscribers, friends]) => friends
        .filter(friend => !subscribers.some(s => s.id === friend.id))
        .sort((a, b) => a.nickname.localeCompare(b.nickname, 'es', { sensitivity: 'base' })))
    ),
    { initialValue: [] as Player[] }
  );

  readonly searchTerm = signal('');

  readonly filteredList = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return term
      ? this.friends().filter(friend => friend.nickname?.toLowerCase().includes(term))
      : this.friends();
  });

  filterList(event: SearchbarCustomEvent) {
    this.searchTerm.set(event.detail.value ?? '');
  }

  async addNewFriend() {
    const modal = await this.modalController.create({
      component: AddNewFriendPage,
      componentProps: {
        matchId: this.matchId,
        friends: this.friends(),
      }
    });
    await modal.present();
  }

  async addFriendAlert(player: Player) {
    const alert = await this.alertController.create({
      backdropDismiss: false,
      header: 'Anotar amigo!',
      message: `Vas a anotar a ${player.nickname}.`,
      mode: 'ios',
      buttons: [
        { text: 'No, le erré 👎', role: 'cancel', cssClass: 'secondary' },
        { text: 'Si 😀', handler: () => { this.joinMatch(player); } }
      ]
    });
    await alert.present();
  }

  private async joinMatch(player: Player) {
    await this.loadingService.showLoading();
    try {
      await this.dbService.joinMatch(player, this.matchId);
      await this.toastService.successToast('Amigo anotado!');
      await this.router.navigateByUrl(`match/${this.matchId}`);
    } catch (err) {
      if (err instanceof MatchFullError) {
        await this.toastService.infoToast('El partido ya está completo.');
      } else {
        console.error(err);
        await this.toastService.errorToast();
      }
    } finally {
      await this.loadingService.hideLoading();
    }
  }

}
