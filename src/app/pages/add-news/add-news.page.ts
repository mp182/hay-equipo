import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToolbar
} from '@ionic/angular';

import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-add-news',
  templateUrl: './add-news.page.html',
  styleUrls: ['./add-news.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToolbar
  ],
})
export class AddNewsPage {

  private readonly dbService = inject(DbService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly newsForm = inject(FormBuilder).nonNullable.group({
    description: ['', Validators.required]
  });

  async addNews() {
    await this.loadingService.showLoading();
    try {
      await this.dbService.addNews(this.newsForm.getRawValue().description.trim());
      this.newsForm.reset();
      await this.router.navigateByUrl('dashboard');
      await this.toastService.successToast('Novedad registrada! ✨');
    } catch {
      await this.toastService.errorToast();
    } finally {
      await this.loadingService.hideLoading();
    }
  }

}
