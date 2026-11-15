import { Injectable, inject } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class LoadingService {

  private readonly loadingController = inject(LoadingController);
  private loading?: Promise<HTMLIonLoadingElement>;

  async showLoading(message = 'Trabajando ...') {
    // Si ya hay uno abierto lo cerramos, para no dejar loaders colgados.
    await this.hideLoading();
    this.loading = this.loadingController.create({ message });
    await (await this.loading).present();
  }

  async hideLoading() {
    const loading = this.loading;
    this.loading = undefined;
    if (loading) {
      await (await loading).dismiss();
    }
  }

}
