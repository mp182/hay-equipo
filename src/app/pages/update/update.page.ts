import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon,
  IonItem, IonList, IonTitle, IonToolbar, ModalController
} from '@ionic/angular';

import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
  imports: [
    AsyncPipe,
    IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon,
    IonItem, IonList, IonTitle, IonToolbar
  ],
})
export class UpdatePage {

  private readonly modalController = inject(ModalController);

  readonly news$ = inject(DbService).getNews();

  async updateApp() {
    await this.modalController.dismiss().catch(() => undefined);
    window.location.href = '/dashboard';
  }

}
