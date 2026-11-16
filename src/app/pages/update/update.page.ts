import { Component, inject, input } from '@angular/core';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon,
  IonItem, IonList, IonTitle, IonToolbar, ModalController
} from '@ionic/angular';

import { ChangelogEntry } from 'src/app/changelog';

/** Modal con las novedades de la versión que se acaba de abrir (lo abre `AppUpdateService.showWhatsNew`). */
@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
  imports: [
    IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon,
    IonItem, IonList, IonTitle, IonToolbar
  ],
})
export class UpdatePage {

  /** Se pasa como `componentProps` desde el modal. */
  readonly entries = input<ChangelogEntry[]>([]);

  private readonly modalController = inject(ModalController);

  close() {
    return this.modalController.dismiss();
  }

}
