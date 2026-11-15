import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AlertController, IonButton, IonCol, IonContent, IonGrid, IonInput, IonItem, IonRow, MenuController
} from '@ionic/angular';
import { Subscription, filter, take } from 'rxjs';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoadingService } from 'src/app/services/loading.service';
import { firebaseErrors } from '../../helpers/firebaseErrors';
import { EMAIL_PATTERN } from '../../helpers/string.helpers';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [ReactiveFormsModule, RouterLink, IonButton, IonCol, IonContent, IonGrid, IonInput, IonItem, IonRow],
})
export class LoginPage {

  private readonly alertController = inject(AlertController);
  private readonly authService = inject(AuthenticationService);
  private readonly loadingService = inject(LoadingService);
  private readonly menuCtrl = inject(MenuController);
  private readonly router = inject(Router);

  private playerSubscription?: Subscription;

  readonly errorMessage = signal('');

  readonly loginForm = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', [Validators.required, Validators.minLength(5)]],
  });

  ionViewWillEnter() {
    this.menuCtrl.enable(false);

    // Si ya hay una sesión iniciada, preguntamos si quiere seguir con esa cuenta.
    this.playerSubscription = this.authService.player$.pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(async user => {
      const alert = await this.alertController.create({
        header: 'Sesión iniciada!',
        subHeader: 'Continuar...?',
        backdropDismiss: false,
        message: `Iniciaste sesión como ${user!.nickname}.`,
        buttons: [
          { text: 'No', handler: () => { this.authService.logoutUser(); } },
          { text: 'Si, soy yo', handler: () => { this.router.navigateByUrl('dashboard'); } }
        ]
      });
      await alert.present();
    });
  }

  ionViewWillLeave() {
    this.playerSubscription?.unsubscribe();
    this.menuCtrl.enable(true);
  }

  async loginUser() {
    this.playerSubscription?.unsubscribe();
    await this.loadingService.showLoading();
    try {
      await this.authService.loginUser(this.loginForm.getRawValue());
      this.errorMessage.set('');
      await this.router.navigateByUrl('dashboard');
    } catch (err: any) {
      this.errorMessage.set(firebaseErrors(err?.code));
    } finally {
      await this.loadingService.hideLoading();
    }
  }

  async loginWithGoogle() {
    this.playerSubscription?.unsubscribe();
    try {
      await this.authService.loginWithGoogle();
      this.errorMessage.set('');
      await this.router.navigateByUrl('dashboard');
    } catch (err: any) {
      this.errorMessage.set(firebaseErrors(err?.code));
    }
  }

}
