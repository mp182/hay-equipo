import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, MenuController } from '@ionic/angular';

import { LogoMarkComponent } from 'src/app/components/logo-mark/logo-mark.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { firebaseErrors } from '../../helpers/firebaseErrors';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, LogoMarkComponent],
})
export class LoginPage {

  private readonly authService = inject(AuthenticationService);
  private readonly menuCtrl = inject(MenuController);
  private readonly router = inject(Router);

  /** Mientras se revisa si ya hay una sesión iniciada, no se muestra el botón. */
  readonly checkingSession = signal(true);
  /** Mientras se abre Google o se termina el ingreso. */
  readonly signingIn = signal(false);
  readonly errorMessage = signal('');

  async ionViewWillEnter() {
    this.menuCtrl.enable(false);
    this.checkingSession.set(true);

    try {
      // Si se volvió de la página de Google (plan B cuando el popup está bloqueado), terminamos el ingreso.
      const cameBackFromGoogle = await this.authService.completeRedirectLogin();
      // Con la sesión ya iniciada, entramos directo sin preguntar.
      if (cameBackFromGoogle || await this.authService.isLoggedIn()) {
        await this.goToDashboard();
        return;
      }
    } catch (err: any) {
      this.showError(err);
    }

    this.checkingSession.set(false);
  }

  ionViewWillLeave() {
    this.menuCtrl.enable(true);
  }

  async loginWithGoogle() {
    if (this.signingIn()) {
      return;
    }
    this.errorMessage.set('');
    this.signingIn.set(true);

    try {
      const loggedIn = await this.authService.loginWithGoogle();
      if (loggedIn) {
        await this.goToDashboard();
      }
      // Si no, la app se fue a la página de Google y va a volver recargando el login.
    } catch (err: any) {
      this.showError(err);
    } finally {
      this.signingIn.set(false);
    }
  }

  private goToDashboard() {
    return this.router.navigateByUrl('dashboard', { replaceUrl: true });
  }

  private showError(err: any) {
    // Se vacía primero para que el mensaje se vuelva a crear y repita la animación.
    this.errorMessage.set('');
    setTimeout(() => this.errorMessage.set(firebaseErrors(err?.code)));
  }

}
