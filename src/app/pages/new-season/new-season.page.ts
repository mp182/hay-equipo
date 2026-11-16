import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
    DatePipe,
    IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
    IonContent, IonHeader, IonTitle, IonToolbar
  ],
})
export class NewSeasonPage {

  private readonly db = inject(DbService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  /** Cuándo empezó la temporada actual (si se arrancó desde la app). */
  readonly seasonStart = toSignal(this.db.getSeasonStart());
  /** Mientras se aplica: evita el doble toque. */
  readonly starting = signal(false);

  /** `true` si la temporada actual empezó hace menos de un día (las reglas no dejan arrancar otra). */
  startedToday() {
    const start = this.seasonStart();
    return !!start && Date.now() - start.getTime() < 24 * 60 * 60 * 1000;
  }

  async newSeason() {
    if (this.starting() || this.startedToday()) {
      return;
    }
    this.starting.set(true);
    await this.loadingService.showLoading();
    try {
      await this.db.startNewSeason();
      await this.router.navigateByUrl('dashboard');
      await this.toastService.successToast('Nueva Temporada 🔃✔');
    } catch (err: unknown) {
      if ((err as { code?: string })?.code === 'permission-denied') {
        // Las reglas la rechazan si ya se arrancó una en las últimas 24 horas.
        await this.toastService.infoToast('La temporada ya se arrancó hoy. No se tocó nada.');
      } else {
        console.error(err);
        await this.toastService.errorToast();
      }
    } finally {
      this.starting.set(false);
      await this.loadingService.hideLoading();
    }
  }

}
