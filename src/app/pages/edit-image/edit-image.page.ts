import { AsyncPipe } from '@angular/common';
import { Component, EnvironmentInjector, inject, runInInjectionContext, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Storage, getDownloadURL, ref, uploadBytes, uploadString } from '@angular/fire/storage';
import {
  IonBackButton, IonButton, IonButtons, IonCard, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem,
  IonLabel, IonList, IonProgressBar, IonRow, IonSpinner, IonTitle, IonToolbar
} from '@ionic/angular';

import { SafeImageDirective } from 'src/app/directives/safe-image.directive';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DbService } from 'src/app/services/db.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-edit-image',
  templateUrl: './edit-image.page.html',
  styleUrls: ['./edit-image.page.scss'],
  imports: [
    AsyncPipe, SafeImageDirective,
    IonBackButton, IonButton, IonButtons, IonCard, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem,
    IonLabel, IonList, IonProgressBar, IonRow, IonSpinner, IonTitle, IonToolbar
  ],
})
export class EditImagePage {

  private readonly db = inject(DbService);
  private readonly injector = inject(EnvironmentInjector);
  private readonly router = inject(Router);
  private readonly storage = inject(Storage);
  private readonly toastService = inject(ToastService);

  readonly player$ = inject(AuthenticationService).player$;

  readonly selectedFile = signal<File | null>(null);
  readonly loading = signal(false);

  detectFiles(event: Event) {
    this.selectedFile.set((event.target as HTMLInputElement).files?.item(0) ?? null);
  }

  uploadSingle(playerId: string) {
    const file = this.selectedFile();
    if (file) {
      this.uploadAvatar(playerId, path => uploadBytes(ref(this.storage, path), file, { contentType: file.type }));
    }
  }

  async takePicture(playerId: string) {
    try {
      const photo = await Camera.getPhoto({
        quality: 50,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      await this.uploadAvatar(playerId, path => uploadString(
        ref(this.storage, path), photo.base64String!, 'base64', { contentType: `image/${photo.format}` }
      ));
    } catch (err: any) {
      // Si el usuario cierra la cámara no mostramos error.
      if (!String(err?.message ?? '').toLowerCase().includes('cancel')) {
        await this.toastService.errorToast();
      }
    }
  }

  /** Sube la imagen a `avatars/{playerId}` y guarda la URL en el jugador. */
  private async uploadAvatar(playerId: string, upload: (path: string) => Promise<unknown>) {
    this.loading.set(true);
    try {
      const path = `avatars/${playerId}`;
      await runInInjectionContext(this.injector, () => upload(path));
      const url = await runInInjectionContext(this.injector, () => getDownloadURL(ref(this.storage, path)));
      await this.db.updateImage(url, playerId);
      await this.toastService.successToast('Cambiaste tu avatar!');
      await this.router.navigateByUrl('dashboard');
    } catch (err) {
      console.error(err);
      await this.toastService.errorToast();
    } finally {
      this.loading.set(false);
      this.selectedFile.set(null);
    }
  }

}
