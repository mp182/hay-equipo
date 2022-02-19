import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { nextSaturday } from '../../helpers/date.helpers';
import { ToastService } from 'src/app/services/toast.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-game',
  templateUrl: './add-game.page.html',
  styleUrls: ['./add-game.page.scss'],
})
export class AddGamePage implements OnInit {

  matchForm: FormGroup;
  nextSaturday: Date = nextSaturday();
  maxPlayerPopoverOptions: any = {
    header: 'Elegí uno 👇'
  };

  constructor(
    private dbService: DbService,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.matchForm = this.formBuilder.group({
      date: new FormControl(this.nextSaturday.toISOString(), Validators.compose([Validators.required])),
      time: new FormControl('19:00', Validators.compose([Validators.required])),
      maxPlayers: new FormControl('12', Validators.compose([Validators.required])),
      location: new FormControl('La Filial', Validators.compose([Validators.required]))
    });
  }

  ionViewWillEnter() {
    this.loadingService.showLoading();
  }

  ionViewDidEnter() {
    this.loadingService.hideLoading();
  }

  addMatch(value: { time: string; date: string; maxPlayers: number; location: string }) {
    const hour: number = +value.time.split(':')[0];
    const minutes: number = +value.time.split(':')[1];
    const matchDate = new Date(value.date);
    matchDate.setHours(hour);
    matchDate.setMinutes(minutes);
    matchDate.setSeconds(0);
    matchDate.setMilliseconds(0);
    this.dbService.addMatch(matchDate, value.maxPlayers, value.location)
      .then(() => {
        this.router.navigateByUrl('dashboard');
        this.toastService.successToast('Partido creado! ⚽');
      }, () => {
        this.toastService.errorToast();
      });
  }

}
