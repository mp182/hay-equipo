import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import {
  IonButton, IonButtons, IonContent, IonHeader, IonInput, IonTitle, IonToolbar
} from '@ionic/angular';

import { NavigationHistoryService } from 'src/app/services/navigation-history.service';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { titleCase } from '../../helpers/string.helpers';

function noWhitespaceValidator(control: AbstractControl<string>): ValidationErrors | null {
  return (control.value || '').trim().length === 0 ? { whitespace: true } : null;
}

@Component({
  selector: 'app-change-nickname',
  templateUrl: './change-nickname.page.html',
  styleUrls: ['./change-nickname.page.scss'],
  imports: [
    BackButtonComponent, ReactiveFormsModule,
    IonButton, IonButtons, IonContent, IonHeader, IonInput, IonTitle, IonToolbar
  ],
})
export class ChangeNicknamePage {

  private readonly history = inject(NavigationHistoryService);
  private readonly authService = inject(AuthenticationService);
  private readonly dbService = inject(DbService);
  private readonly loadingService = inject(LoadingService);
  private readonly toastService = inject(ToastService);

  readonly nickname = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3), noWhitespaceValidator]
  });

  async updateNickname() {
    await this.loadingService.showLoading();
    try {
      const user = await this.authService.userDetails();
      await this.dbService.updateNickname(titleCase(this.nickname.value), user!.uid);
      this.nickname.reset();
      await this.toastService.successToast('Cambiaste tu apodo!');
      await this.history.backTo('/dashboard');
    } catch {
      await this.toastService.errorToast();
    } finally {
      await this.loadingService.hideLoading();
    }
  }

}
