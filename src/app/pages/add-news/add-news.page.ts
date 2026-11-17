import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton, IonButtons, IonContent, IonHeader, IonInput, IonTitle, IonToolbar
} from '@ionic/angular';

import { NavigationHistoryService } from 'src/app/services/navigation-history.service';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-add-news',
  templateUrl: './add-news.page.html',
  styleUrls: ['./add-news.page.scss'],
  imports: [
    BackButtonComponent, ReactiveFormsModule,
    IonButton, IonButtons, IonContent, IonHeader, IonInput, IonTitle, IonToolbar
  ],
})
export class AddNewsPage {

  private readonly history = inject(NavigationHistoryService);
  private readonly dbService = inject(DbService);
  private readonly loadingService = inject(LoadingService);
  private readonly toastService = inject(ToastService);

  readonly newsForm = inject(FormBuilder).nonNullable.group({
    description: ['', Validators.required]
  });

  async addNews() {
    await this.loadingService.showLoading();
    try {
      await this.dbService.addNews(this.newsForm.getRawValue().description.trim());
      this.newsForm.reset();
      await this.history.backTo('/dashboard');
      await this.toastService.successToast('Novedad registrada! ✨');
    } catch {
      await this.toastService.errorToast();
    } finally {
      await this.loadingService.hideLoading();
    }
  }

}
