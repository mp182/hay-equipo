import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ToastService {

  private readonly toastController = inject(ToastController);

  successToast(text: string) {
    return this.show(text, '✔️');
  }

  errorToast() {
    return this.show('Ups! Algo salió mal...', '❌');
  }

  infoToast(text: string) {
    return this.show(text, 'ℹ️');
  }

  private async show(message: string, buttonText: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      buttons: [{ text: buttonText, role: 'cancel' }]
    });
    await toast.present();
  }
}
