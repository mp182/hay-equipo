import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonButton, IonCol, IonContent, IonGrid, IonRow, MenuController } from '@ionic/angular';
import { Subscription, filter, take } from 'rxjs';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { firebaseErrors } from '../../helpers/firebaseErrors';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonButton, IonCol, IonContent, IonGrid, IonRow],
})
export class LoginPage {

  private readonly alertController = inject(AlertController);
  private readonly authService = inject(AuthenticationService);
  private readonly menuCtrl = inject(MenuController);
  private readonly router = inject(Router);

  private playerSubscription?: Subscription;

  readonly errorMessage = signal('');

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

  async loginWithGoogle() {
    this.playerSubscription?.unsubscribe();
    this.errorMessage.set('');
    try {
      await this.authService.loginWithGoogle();
      await this.router.navigateByUrl('dashboard');
    } catch (err: any) {
      this.errorMessage.set(firebaseErrors(err?.code));
    }
  }

}
