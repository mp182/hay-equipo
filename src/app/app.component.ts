import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  IonApp, IonAvatar, IonChip, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu,
  IonRouterOutlet, IonSplitPane, IonTitle, IonToolbar, MenuController
} from '@ionic/angular';

import { LogoMarkComponent } from './components/logo-mark/logo-mark.component';
import { AuthenticationService } from './services/authentication.service';
import { LoadingService } from './services/loading.service';
import { ConnectionService } from './services/connection.service';
import { SafeImageDirective } from './directives/safe-image.directive';
import { registerIcons } from './icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    AsyncPipe, RouterLink, SafeImageDirective, LogoMarkComponent,
    IonApp, IonAvatar, IonChip, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu,
    IonRouterOutlet, IonSplitPane, IonTitle, IonToolbar
  ],
})
export class AppComponent {

  private readonly authService = inject(AuthenticationService);
  private readonly menuCtrl = inject(MenuController);
  private readonly router = inject(Router);

  readonly loadingService = inject(LoadingService);

  readonly user$ = this.authService.player$;

  constructor() {
    registerIcons();

    inject(ConnectionService).monitor()
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(isConnected => this.onConnectionChange(isConnected));
  }

  /** Pantalla en la que estaba el usuario cuando se cortó la conexión, para volver ahí. */
  private urlBeforeOffline?: string;

  private onConnectionChange(isConnected: boolean) {
    if (!isConnected) {
      if (!this.router.url.startsWith('/no-internet')) {
        this.urlBeforeOffline = this.router.url;
      }
      this.router.navigateByUrl('no-internet');
      return;
    }
    // Si se cortó en el login (o nunca supimos dónde estaba), el guard decide adónde ir desde el dashboard.
    const target = this.urlBeforeOffline && this.urlBeforeOffline !== '/' ? this.urlBeforeOffline : 'dashboard';
    this.urlBeforeOffline = undefined;
    this.router.navigateByUrl(target, { replaceUrl: true });
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

}
