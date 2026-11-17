import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonDatetime, IonDatetimeButton, IonHeader, IonInput,
  IonModal, IonSelect, IonSelectOption, IonTitle, IonToolbar
} from '@ionic/angular';

import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { nextSaturday, toLocalIsoString } from '../../helpers/date.helpers';

@Component({
  selector: 'app-add-game',
  templateUrl: './add-game.page.html',
  styleUrls: ['./add-game.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonBackButton, IonButton, IonButtons, IonContent, IonDatetime, IonDatetimeButton, IonHeader, IonInput,
    IonModal, IonSelect, IonSelectOption, IonTitle, IonToolbar
  ],
})
export class AddGamePage {

  private readonly dbService = inject(DbService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly maxPlayerOptions = { header: 'Elegí uno 👇' };

  readonly matchForm = inject(FormBuilder).nonNullable.group({
    // Por defecto: el próximo sábado a las 19 hs.
    date: [toLocalIsoString(nextSaturday(19, 0)), Validators.required],
    maxPlayers: [12, Validators.required],
    location: ['La Filial', Validators.required]
  });

  async addMatch() {
    const { date, maxPlayers, location } = this.matchForm.getRawValue();
    const matchDate = new Date(date);
    matchDate.setSeconds(0, 0);

    await this.loadingService.showLoading();
    try {
      await this.dbService.addMatch(matchDate, +maxPlayers, location.trim());
      await this.router.navigateByUrl('dashboard');
      await this.toastService.successToast('Partido creado! ⚽');
    } catch {
      await this.toastService.errorToast();
    } finally {
      await this.loadingService.hideLoading();
    }
  }

}
