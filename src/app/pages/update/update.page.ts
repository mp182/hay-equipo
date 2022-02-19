import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
})
export class UpdatePage {

  news$: Observable<any>;

  constructor(
    private dbService: DbService,
    private loadingService: LoadingService,
    private navCtrl: NavController
  ) { }

  ionViewWillEnter() {
    this.loadingService.showLoading();
    this.news$ = this.dbService.getNews();
  }

  ionViewDidEnter() {
    this.loadingService.hideLoading();
  }

  updateApp() {
    this.navCtrl.navigateRoot('dashboard');
    window.location.reload();
  }

}
