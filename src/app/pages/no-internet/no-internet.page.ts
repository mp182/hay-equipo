import { Component, inject } from '@angular/core';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-no-internet',
  templateUrl: './no-internet.page.html',
  styleUrls: ['./no-internet.page.scss'],
  imports: [
    IonContent, IonHeader, IonIcon, IonTitle, IonToolbar
  ],
})
export class NoInternetPage {

  private readonly menuCtrl = inject(MenuController);

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  ionViewWillLeave() {
    this.menuCtrl.enable(true);
  }

}
