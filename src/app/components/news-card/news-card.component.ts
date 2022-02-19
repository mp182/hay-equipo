import { Component, Input } from '@angular/core';
import { News } from 'src/app/models/news.interface';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'news-card',
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.scss'],
})
export class NewsCardComponent {

  @Input() news: News[];
  @Input() admin: boolean;
  deleting: string;

  constructor(
    private dbService: DbService
  ) { }

  delete(newsId: string) {
    this.deleting = newsId;
    setTimeout(() => {
      this.dbService.deleteCardNews(newsId)
        .then(() => this.deleting = '');
    }, 1500);
  }

}
