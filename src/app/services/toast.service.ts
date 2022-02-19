import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  async successToast(text: string) {
    const toast = await this.toastController.create({
      message: text,
      duration: 2500,
      buttons: [
        {
          text: '✔️',
          role: 'cancel',
        }
      ]
    });
    toast.present();
  }

  async errorToast() {
    const toast = await this.toastController.create({
      message: 'Ups! Algo salió mal...',
      duration: 2500,
      buttons: [
        {
          text: '❌',
          role: 'cancel',
        }
      ]
    });
    toast.present();
  }

  async infoToast(text: string) {
    const toast = await this.toastController.create({
      message: text,
      duration: 2500,
      buttons: [
        {
          text: 'ℹ️',
          role: 'cancel',
        }
      ]
    });
    toast.present();
  }
}
