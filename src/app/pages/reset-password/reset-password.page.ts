import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToolbar
} from '@ionic/angular';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { EMAIL_PATTERN } from '../../helpers/string.helpers';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToolbar
  ],
})
export class ResetPasswordPage {

  private readonly authService = inject(AuthenticationService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly resetPasswordForm = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
  });

  async resetPassword() {
    await this.loadingService.showLoading();
    try {
      await this.authService.resetPassword(this.resetPasswordForm.getRawValue());
      await this.toastService.successToast('Revisa tu email para continuar!');
      await this.router.navigateByUrl('login');
    } catch {
      await this.toastService.errorToast();
    } finally {
      await this.loadingService.hideLoading();
    }
  }
}
