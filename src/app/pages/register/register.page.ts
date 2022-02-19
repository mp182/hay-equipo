import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  registeForm: FormGroup;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.registeForm = this.formBuilder.group({
      nickname: new FormControl('', Validators.compose([
        Validators.minLength(3),
        Validators.required
      ])),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
    });
  }

  ionViewWillEnter() {
    this.loadingService.showLoading();
  }

  ionViewDidEnter() {
    this.loadingService.hideLoading();
  }

  register(value: { email: string; password: string; nickname: string; }) {
    this.authService.registerUser(value)
      .then(() => {
        this.toastService.successToast('Cuenta creada!');
        this.router.navigateByUrl('login');
      }, () => {
        this.toastService.errorToast();
      });
  }

  navigateToLogin() {
    this.router.navigateByUrl('login');
  }

}
