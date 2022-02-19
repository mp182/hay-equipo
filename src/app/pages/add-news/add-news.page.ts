import { Component, OnInit } from '@angular/core';
import { DbService } from 'src/app/services/db.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-news',
  templateUrl: './add-news.page.html',
  styleUrls: ['./add-news.page.scss'],
})
export class AddNewsPage implements OnInit {

  newsForm: FormGroup;

  constructor(
    private dbService: DbService,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.newsForm = this.formBuilder.group({
      description: new FormControl('', Validators.compose([Validators.required]))
    });
  }

  ionViewWillEnter() {
    this.loadingService.showLoading();
  }

  ionViewDidEnter() {
    this.loadingService.hideLoading();
  }

  addNews(value: { description: string }) {
    this.loadingService.showLoading();
    this.dbService.addNews(value.description)
      .then(() => {
        this.loadingService.hideLoading();
        this.router.navigateByUrl('dashboard');
        this.toastService.successToast('Novedad registrada! ✨');
      }, () => {
        this.loadingService.hideLoading();
        this.toastService.errorToast();
      });
  }

}
