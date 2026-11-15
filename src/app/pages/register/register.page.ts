import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToolbar
} from '@ionic/angular';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastService } from 'src/app/services/toast.service';
import { firebaseErrors } from '../../helpers/firebaseErrors';
import { EMAIL_PATTERN } from '../../helpers/string.helpers';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [
    ReactiveFormsModule, RouterLink,
    IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToolbar
  ],
})
export class RegisterPage {

  private readonly authService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly registerForm = inject(FormBuilder).nonNullable.group({
    nickname: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async register() {
    try {
      await this.authService.registerUser(this.registerForm.getRawValue());
      await this.toastService.successToast('Cuenta creada!');
      await this.router.navigateByUrl('dashboard');
    } catch (err: any) {
      await this.toastService.infoToast(firebaseErrors(err?.code));
    }
  }

}
