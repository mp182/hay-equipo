import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  loading: Promise<HTMLIonLoadingElement>;

  constructor(private loadingController: LoadingController) { }

  async showLoading(message?: string) {
    this.loading = !!message
      ? this.loadingController.create({ message })
      : this.loadingController.create({ message: 'Trabajando ...' });
    (await this.loading).present();
  }

  async hideLoading() {
    (await this.loading).dismiss();
  }

}
