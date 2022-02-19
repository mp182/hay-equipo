import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastService } from 'src/app/services/toast.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-nickname',
  templateUrl: './change-nickname.page.html',
  styleUrls: ['./change-nickname.page.scss'],
})
export class ChangeNicknamePage {

  nickname = new FormControl('', Validators.compose([Validators.minLength(3), Validators.required, this.noWhitespaceValidator]));

  constructor(
    private authService: AuthenticationService,
    private dbService: DbService,
    private loadingService: LoadingService,
    private router: Router,
    private toastService: ToastService
  ) { }

  async updateNickname(nickname: string) {
    this.loadingService.showLoading();

    const player = this.authService.userDetails();

    this.dbService.updateNickname(nickname.trim(), (await player).uid)
      .then(() => {
        this.loadingService.hideLoading();
        this.toastService.successToast('Cambiaste tu apodo!');
        this.router.navigateByUrl('dashboard');
      }, () => {
        this.loadingService.hideLoading();
        this.toastService.errorToast();
      });
  }

  private noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

}
