import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  IonApp, IonAvatar, IonChip, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu,
  IonRouterOutlet, IonSplitPane, IonTitle, IonToolbar, MenuController
} from '@ionic/angular';

import { AuthenticationService } from './services/authentication.service';
import { ConnectionService } from './services/connection.service';
import { SafeImageDirective } from './directives/safe-image.directive';
import { registerIcons } from './icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    AsyncPipe, RouterLink, SafeImageDirective,
    IonApp, IonAvatar, IonChip, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu,
    IonRouterOutlet, IonSplitPane, IonTitle, IonToolbar
  ],
})
export class AppComponent {

  private readonly authService = inject(AuthenticationService);
  private readonly menuCtrl = inject(MenuController);
  private readonly router = inject(Router);

  readonly user$ = this.authService.player$;

  constructor() {
    registerIcons();

    inject(ConnectionService).monitor()
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(isConnected => this.router.navigateByUrl(isConnected ? 'dashboard' : 'no-internet'));
  }

  async logout() {
    try {
      await this.authService.logoutUser();
      await this.menuCtrl.close();
      await this.router.navigateByUrl('login');
    } catch (error) {
      console.error(error);
    }
  }

  editNickname() {
    this.router.navigate(['change-nickname']);
    this.menuCtrl.close();
  }

  editImage() {
    this.router.navigate(['edit-image']);
    this.menuCtrl.close();
  }

}
