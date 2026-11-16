import { Component, inject } from '@angular/core';
import {
  IonAvatar, IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent,
  IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonTitle, IonToolbar, MenuController
} from '@ionic/angular';
import { SafeImageDirective } from 'src/app/directives/safe-image.directive';
import { APP_VERSION } from 'src/app/app-version';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  imports: [
    SafeImageDirective, IonAvatar, IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent,
    IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonTitle, IonToolbar
  ],
})
export class AboutPage {

  readonly version = APP_VERSION;

  private readonly menuCtrl = inject(MenuController);

  ionViewWillEnter() {
    this.menuCtrl.close();
  }

}
