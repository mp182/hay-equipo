import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, InjectionToken, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { filter, fromEvent, interval, merge } from 'rxjs';

import { APP_VERSION } from '../app-version';
import { changesBetween } from '../changelog';
import { compareVersions } from '../helpers/version.helpers';
import { UpdatePage } from '../pages/update/update.page';

/** Cada cuánto se busca una versión nueva mientras la app está abierta. */
export const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000;

/** Recarga la página (en los tests se reemplaza: jsdom no deja tocar `location`). */
export const RELOAD_PAGE = new InjectionToken<() => void>('RELOAD_PAGE', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT);
    return () => document.location.reload();
  }
});

/** Última versión de la que se mostraron las novedades (en este navegador). */
export const LAST_SEEN_VERSION_KEY = 'hay-equipo:last-seen-version';

/**
 * Actualizaciones de la app con el service worker de Angular.
 *
 * - Busca una versión nueva al volver a la app (en el iPhone, la app instalada no se recarga al volver)
 *   y cada 30 minutos. Al abrir la app ya la busca el propio service worker.
 * - Cuando la versión nueva ya está descargada, avisa con un toast: "Actualizar" la activa y recarga.
 *   Si no se actualiza, la versión nueva se usa igual la próxima vez que se abra la app.
 * - Después de actualizar, muestra una sola vez las novedades de la versión (`CHANGELOG`).
 *
 * En desarrollo y con los emuladores no hay service worker: solo se muestran las novedades.
 */
@Injectable({ providedIn: 'root' })
export class AppUpdateService {

  private readonly swUpdate = inject(SwUpdate);
  private readonly alertController = inject(AlertController);
  private readonly modalController = inject(ModalController);
  private readonly toastController = inject(ToastController);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reloadPage = inject(RELOAD_PAGE);

  private promptOpen = false;
  private started = false;

  init() {
    if (this.started || !this.swUpdate.isEnabled) {
      return;
    }
    this.started = true;

    this.swUpdate.versionUpdates
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => this.onVersionEvent(event));

    this.swUpdate.unrecoverable
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => this.onUnrecoverable(event.reason));

    const backToApp = fromEvent(this.document, 'visibilitychange')
      .pipe(filter(() => this.document.visibilityState === 'visible'));
    merge(backToApp, interval(UPDATE_CHECK_INTERVAL))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.checkForUpdate());
  }

  /** Busca una versión nueva. Si la hay, el service worker la descarga y avisa con `VERSION_READY`. */
  async checkForUpdate() {
    if (!this.swUpdate.isEnabled) {
      return;
    }
    try {
      await this.swUpdate.checkForUpdate();
    } catch (err) {
      // Sin conexión o el service worker todavía no está listo: se vuelve a intentar más tarde.
      console.warn('No se pudo buscar una versión nueva', err);
    }
  }

  /** Pasa a la versión nueva y recarga. Si no se pudo activar, recargar igual abre la última versión descargada. */
  async activateAndReload() {
    try {
      await this.swUpdate.activateUpdate();
    } catch (err) {
      console.warn('No se pudo activar la versión nueva', err);
    }
    this.reloadPage();
  }

  /**
   * Si es la primera vez que se abre esta versión, muestra sus novedades (y las de las versiones que se saltearon).
   * La primera vez que se usa la app en este navegador no muestra nada: todo es nuevo.
   */
  async showWhatsNew() {
    const lastSeen = this.readLastSeen();
    this.writeLastSeen(APP_VERSION);
    if (!lastSeen || compareVersions(lastSeen, APP_VERSION) >= 0) {
      return;
    }
    const entries = changesBetween(lastSeen, APP_VERSION);
    if (entries.length === 0) {
      return;
    }
    const modal = await this.modalController.create({
      component: UpdatePage,
      componentProps: { entries }
    });
    await modal.present();
  }

  private onVersionEvent(event: VersionEvent) {
    switch (event.type) {
      case 'VERSION_READY':
        this.promptUpdate();
        break;
      case 'VERSION_INSTALLATION_FAILED':
        console.error('No se pudo descargar la versión nueva', event.error);
        break;
    }
  }

  private async promptUpdate() {
    if (this.promptOpen) {
      return;
    }
    this.promptOpen = true;
    const toast = await this.toastController.create({
      message: 'Hay una versión nueva de Hay Equipo!',
      position: 'bottom',
      color: 'dark',
      buttons: [
        { text: 'Actualizar', handler: () => { this.activateAndReload(); } },
        { text: 'Después', role: 'cancel' }
      ]
    });
    toast.onDidDismiss().then(() => this.promptOpen = false);
    await toast.present();
  }

  /** El service worker quedó en un estado del que no se recupera solo (por ejemplo, le borraron la caché). */
  private async onUnrecoverable(reason: string) {
    console.error('El service worker no se puede recuperar', reason);
    const alert = await this.alertController.create({
      header: 'Hay que recargar la app',
      message: 'Algo se desacomodó con la versión guardada. Recargá para seguir usando Hay Equipo!',
      backdropDismiss: false,
      buttons: [{ text: 'Recargar', handler: () => { this.reloadPage(); } }]
    });
    await alert.present();
  }

  private readLastSeen(): string | null {
    try {
      return localStorage.getItem(LAST_SEEN_VERSION_KEY);
    } catch {
      return null;
    }
  }

  private writeLastSeen(version: string) {
    try {
      localStorage.setItem(LAST_SEEN_VERSION_KEY, version);
    } catch {
      // Sin almacenamiento (modo privado): las novedades no se van a mostrar, no pasa nada.
    }
  }

}
