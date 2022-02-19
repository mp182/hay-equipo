import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {

  reserPasswordForm: FormGroup;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.reserPasswordForm = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ]))
    });
  }

  ionViewWillEnter() {
    this.loadingService.showLoading();
  }

  ionViewDidEnter() {
    this.loadingService.hideLoading();
  }

  resetPassword(value: { email: string; }) {
    this.loadingService.showLoading();
    this.authService.resetPassword(value)
      .then(() => {
        this.loadingService.hideLoading();
        this.toastService.successToast('Revisa tu email para continuar!');
        this.router.navigateByUrl('login');
      }, () => {
        this.loadingService.hideLoading();
        this.toastService.errorToast();
      });
  }
}
