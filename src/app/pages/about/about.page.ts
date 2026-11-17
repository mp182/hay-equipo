import { Component, inject } from '@angular/core';
import {
  IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, MenuController
} from '@ionic/angular';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { LogoMarkComponent } from 'src/app/components/logo-mark/logo-mark.component';
import { SafeImageDirective } from 'src/app/directives/safe-image.directive';
import { APP_VERSION } from 'src/app/app-version';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  imports: [
    BackButtonComponent, LogoMarkComponent, SafeImageDirective,
    IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar
  ],
})
export class AboutPage {

  readonly version = APP_VERSION;

  private readonly menuCtrl = inject(MenuController);

  ionViewWillEnter() {
    this.menuCtrl.close();
  }

}
