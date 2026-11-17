import { Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonTitle, IonToolbar, ModalController,
  NavController
} from '@ionic/angular';

import { Player } from 'src/app/models/player.interface';
import { DbService, MatchFullError } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';

/** Modal para anotar a un amigo que todavía no está en la lista. */
@Component({
  selector: 'app-add-new-friend',
  templateUrl: './add-new-friend.page.html',
  styleUrls: ['./add-new-friend.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonTitle, IonToolbar
  ],
})
export class AddNewFriendPage {

  /** Se pasan como `componentProps` desde el modal. */
  readonly matchId = input.required<string>();
  readonly friends = input<Player[]>([]);

  private readonly dbService = inject(DbService);
  private readonly loadingService = inject(LoadingService);
  private readonly modalCtrl = inject(ModalController);
  private readonly navCtrl = inject(NavController);
  private readonly toastService = inject(ToastService);

  readonly newFriendForm = inject(FormBuilder).nonNullable.group({
    nickname: ['', [Validators.required, Validators.minLength(3)]]
  });

  dismiss() {
    return this.modalCtrl.dismiss();
  }

  async saveFriend() {
    const nickname = this.newFriendForm.getRawValue().nickname.trim();
    const alreadyExists = this.friends()
      .some(friend => friend.nickname.toLowerCase().trim() === nickname.toLowerCase());

    if (alreadyExists) {
      await this.dismiss();
      await this.toastService.infoToast('Ese amigo está en la lista!');
      return;
    }

    await this.loadingService.showLoading();
    try {
      await this.dbService.addNewFriend(this.matchId(), nickname);
      await this.dismiss();
      await this.toastService.successToast('Amigo nuevo registrado!');
      this.navCtrl.back();
    } catch (err) {
      if (err instanceof MatchFullError) {
        await this.dismiss();
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
