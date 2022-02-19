import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertController, MenuController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import * as FirebaseErrors from '../../helpers/firebaseErrors';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  playerSubscription: Subscription;
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private menuCtrl: MenuController,
    private router: Router,
    public alertController: AlertController
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ])),
    });
  }

  ionViewWillEnter() {
    this.loadingService.showLoading();

    this.playerSubscription = this.authService.player$.subscribe(async user => {
      if (user) {
        const alert = await this.alertController.create({
          header: 'Sesión iniciada!',
          subHeader: 'Continuar...?',
          backdropDismiss: false,
          message: `Iniciaste sesión como <strong>${user.nickname}<strong>.`,
          buttons: [
            {
              text: 'No',
              handler: () => {
                this.authService.logoutUser();
              }
            }, {
              text: 'Si, soy yo',
              handler: () => {
                this.router.navigateByUrl('dashboard');
              }
            }
          ]
        });

        await alert.present();

      }
      this.loadingService.hideLoading();
    });

    this.menuCtrl.enable(false);
  }

  ionViewWillLeave() {
    if (this.playerSubscription) { this.playerSubscription.unsubscribe(); }
    this.menuCtrl.enable(true);
  }

  async loginUser(value: { email: string; password: string; }) {
    this.loadingService.showLoading();
    this.authService.loginUser(value)
      .then(async () => {
        this.errorMessage = '';
        this.loadingService.hideLoading();
        this.router.navigateByUrl('dashboard');
      }, async err => {
        this.errorMessage = FirebaseErrors.firebaseErrors(err.code);
        this.loadingService.hideLoading();
      });
  }

  async loginWithGoogle() {
    this.loadingService.showLoading();
    this.authService.loginWithGoogle().then(async () => {
      this.errorMessage = '';
      this.loadingService.hideLoading();
      this.router.navigateByUrl('dashboard');
    }, async err => {
      this.errorMessage = err.message;
      this.loadingService.hideLoading();
    });
  }

}
