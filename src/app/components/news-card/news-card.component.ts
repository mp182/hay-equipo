import { Component, inject, input, signal } from '@angular/core';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonItem, IonSpinner, IonText
} from '@ionic/angular';

import { News } from 'src/app/models/news.interface';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-news-card',
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.scss'],
  imports: [IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonItem, IonSpinner, IonText],
})
export class NewsCardComponent {

  readonly news = input<News[] | null>([]);
  readonly admin = input(false);

  readonly deleting = signal('');

  private readonly dbService = inject(DbService);

  delete(newsId: string) {
    this.deleting.set(newsId);
    setTimeout(() => {
      this.dbService.deleteCardNews(newsId)
        .finally(() => this.deleting.set(''));
    }, 1500);
  }

}
