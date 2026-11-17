import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton, IonButtons, IonContent, IonDatetime, IonDatetimeButton, IonHeader, IonInput,
  IonModal, IonSelect, IonSelectOption, IonTitle, IonToolbar
} from '@ionic/angular';

import { NavigationHistoryService } from 'src/app/services/navigation-history.service';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { nextSaturday, toLocalIsoString } from '../../helpers/date.helpers';

@Component({
  selector: 'app-add-game',
  templateUrl: './add-game.page.html',
  styleUrls: ['./add-game.page.scss'],
  imports: [
    BackButtonComponent, ReactiveFormsModule,
    IonButton, IonButtons, IonContent, IonDatetime, IonDatetimeButton, IonHeader, IonInput,
    IonModal, IonSelect, IonSelectOption, IonTitle, IonToolbar
  ],
})
export class AddGamePage {

  private readonly history = inject(NavigationHistoryService);
  private readonly dbService = inject(DbService);
  private readonly loadingService = inject(LoadingService);
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
      await this.history.backTo('/dashboard');
      await this.toastService.successToast('Partido creado! ⚽');
    } catch {
      await this.toastService.errorToast();
    } finally {
      await this.loadingService.hideLoading();
    }
  }

}
