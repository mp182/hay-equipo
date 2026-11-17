import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import {
  IonApp, IonAvatar, IonChip, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu,
  IonRouterOutlet, IonSplitPane, IonTitle, IonToolbar, MenuController, ToastController
} from '@ionic/angular';
import { combineLatest, distinctUntilChanged, filter, map, of, share, startWith, switchMap, timer } from 'rxjs';

import { LogoMarkComponent } from './components/logo-mark/logo-mark.component';
import { AuthenticationService } from './services/authentication.service';
import { LoadingService } from './services/loading.service';
import { ConnectionService } from './services/connection.service';
import { SafeImageDirective } from './directives/safe-image.directive';
import { SyncStatusService } from './services/sync-status.service';
import { registerIcons } from './icons';

/** Cuánto tiene que seguir Firestore sin llegar al servidor para avisar que los datos pueden estar viejos. */
const STALE_NOTICE_DELAY = 5000;

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
  private readonly toastController = inject(ToastController);

  readonly loadingService = inject(LoadingService);

  readonly user$ = this.authService.player$;

  constructor() {
    registerIcons();

    const destroyRef = inject(DestroyRef);
    const connection$ = inject(ConnectionService).monitor().pipe(share());

    connection$
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(isConnected => this.onConnectionChange(isConnected));

    // Si se navega mientras no hay conexión (por ejemplo, la navegación inicial al abrir la app ya sin conexión,
    // o el login que entra solo al dashboard), se vuelve a la pantalla de "Sin internet".
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed(destroyRef))
      .subscribe(() => {
        if (this.offline) {
          this.showNoInternet();
        }
      });

    // Hay conexión según el navegador, pero Firestore no llega al servidor: se avisa que los datos pueden estar viejos.
    // Se espera un poco antes de avisar: al abrir la app los datos salen primero de la caché, y eso es normal.
    const staleNotice$ = inject(SyncStatusService).stale$.pipe(
      switchMap(stale => stale ? timer(STALE_NOTICE_DELAY).pipe(map(() => true)) : of(false))
    );
    combineLatest([connection$.pipe(startWith(navigator.onLine)), staleNotice$])
      .pipe(
        // Sin conexión ya está la pantalla de "Sin internet": el aviso sobra.
        map(([isConnected, stale]) => isConnected && stale),
        distinctUntilChanged(),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(show => this.toggleStaleNotice(show));
  }

  /** Pantalla en la que estaba el usuario cuando se cortó la conexión, para volver ahí. */
  private urlBeforeOffline?: string;
  private offline = false;
  private staleNotice?: HTMLIonToastElement;
  private staleNoticeWanted = false;

  private onConnectionChange(isConnected: boolean) {
    if (!isConnected) {
      this.offline = true;
      // Al abrir la app todavía no hay ninguna pantalla: se muestra al terminar la navegación inicial.
      if (this.router.navigated) {
        this.showNoInternet();
      }
      return;
    }
    if (!this.offline) {
      // La app abrió con conexión: no hay nada que hacer.
      return;
    }
    this.offline = false;
    // Si se cortó en el login (o nunca supimos dónde estaba), el guard decide adónde ir desde el dashboard.
    const target = this.urlBeforeOffline && this.urlBeforeOffline !== '/' ? this.urlBeforeOffline : 'dashboard';
    this.urlBeforeOffline = undefined;
    this.router.navigateByUrl(target, { replaceUrl: true });
  }

  private showNoInternet() {
    if (this.router.url.startsWith('/no-internet')) {
      return;
    }
    this.urlBeforeOffline = this.router.url;
    this.router.navigateByUrl('no-internet');
  }

  private async toggleStaleNotice(show: boolean) {
    this.staleNoticeWanted = show;
    if (!show) {
      await this.staleNotice?.dismiss();
      this.staleNotice = undefined;
      return;
    }
    if (this.staleNotice) {
      return;
    }
    const toast = await this.toastController.create({
      message: 'Sin conexión con el servidor: lo que ves puede no estar al día.',
      icon: 'cloud-offline-outline',
      color: 'warning',
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    this.staleNotice = toast;
    toast.onDidDismiss().then(() => {
      if (this.staleNotice === toast) {
        this.staleNotice = undefined;
      }
    });
    await toast.present();
    // Si la conexión volvió mientras se armaba el aviso, se saca.
    if (!this.staleNoticeWanted) {
      await this.toggleStaleNotice(false);
    }
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
