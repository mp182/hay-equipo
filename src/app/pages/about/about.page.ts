import { Component, inject } from '@angular/core';
import {
  IonAvatar, IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent,
  IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonTitle, IonToolbar, MenuController
} from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  imports: [
    IonAvatar, IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent,
    IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonTitle, IonToolbar
  ],
})
export class AboutPage {

  readonly version = environment.version;

  private readonly menuCtrl = inject(MenuController);

  ionViewWillEnter() {
    this.menuCtrl.close();
  }

}
