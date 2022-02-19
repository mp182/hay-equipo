import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LoadingService } from 'src/app/services/loading.service';
import { Player } from 'src/app/models/player.interface';
import { ToastService } from 'src/app/services/toast.service';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-add-new-friend',
  templateUrl: './add-new-friend.page.html',
  styleUrls: ['./add-new-friend.page.scss'],
})
export class AddNewFriendPage implements OnInit {

  @Input() matchId: string;
  @Input() friends: Player[];

  newFriendForm: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private dbService: DbService
  ) { }

  ngOnInit() {
    this.newFriendForm = this.formBuilder.group({
      nickname: new FormControl('', Validators.compose([Validators.minLength(3), Validators.required]))
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  saveFriend(value: { nickname: string }) {
    this.loadingService.showLoading();

    if (this.friends.some(f => f.nickname.toLowerCase().trim() === value.nickname.toLowerCase().trim())) {
      this.loadingService.hideLoading();
      this.modalCtrl.dismiss();
      this.toastService.infoToast('Ese amigo está en la lista!');
    } else {
      this.dbService.addNewFriend(this.matchId, value.nickname)
        .then(() => {
          this.loadingService.hideLoading();
          this.modalCtrl.dismiss();
          this.toastService.successToast('Amigo nuevo registrado!');
          this.navCtrl.back();
        });
    }
  }

}
