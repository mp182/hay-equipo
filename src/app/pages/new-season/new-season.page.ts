import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonContent, IonHeader, IonTitle, IonToolbar
} from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-new-season',
  templateUrl: './new-season.page.html',
  styleUrls: ['./new-season.page.scss'],
  imports: [
    IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
    IonContent, IonHeader, IonTitle, IonToolbar
  ],
})
export class NewSeasonPage {

  private readonly db = inject(DbService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  async newSeason() {
    await this.loadingService.showLoading();
    try {
      await this.db.startNewSeason();
      await this.router.navigateByUrl('dashboard');
      await this.toastService.successToast('Nueva Temporada 🔃✔');
    } catch {
      await this.toastService.errorToast();
    } finally {
      await this.loadingService.hideLoading();
    }
  }

}
