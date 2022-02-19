import { Component } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Player } from 'src/app/models/player.interface';
import { DbService } from 'src/app/services/db.service';
import { Subscription } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { AddNewFriendPage } from '../add-new-friend/add-new-friend.page';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.page.html',
  styleUrls: ['./add-friend.page.scss'],
})
export class AddFriendPage {

  matchId: string;
  friends: Player[];
  filteredList: Player[];
  subscribers: Player[];
  friendsSubscription: Subscription;
  subscribersSubscription: Subscription;
  alertPresent = false;

  constructor(
    private loadingService: LoadingService,
    private activatedRoute: ActivatedRoute,
    private dbService: DbService,
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router,
    private toastService: ToastService
  ) { }

  ionViewWillEnter() {
    this.loadingService.showLoading();

    this.matchId = this.activatedRoute.snapshot.paramMap.get('id');

    this.subscribersSubscription = this.dbService.getSubscribers(this.matchId).subscribe(players => {
      if (players) {
        this.subscribers = players;

        this.friendsSubscription = this.dbService.getFriends().subscribe(friends => {
          if (friends) {
            this.friends = friends.filter(f => !players.some(p => p.id === f.id));
            this.initializeItems();
          }
        });
      }
    });
  }

  ionViewDidEnter() {
    this.loadingService.hideLoading();
  }

  ionViewWillLeave() {
    if (this.subscribersSubscription) { this.subscribersSubscription.unsubscribe(); }
    if (this.friendsSubscription) { this.friendsSubscription.unsubscribe(); }
  }

  async addNewFriend() {
    (await this.modalController.create(
      {
        component: AddNewFriendPage,
        componentProps: {
          matchId: this.matchId,
          friends: this.friends,
        }
      }
    )).present();
  }

  initializeItems(): void {
    this.filteredList = this.friends;
  }

  filterList(evt: any) {
    this.initializeItems();

    const searchTerm = evt.srcElement.value;

    if (!searchTerm) {
      return;
    }

    this.filteredList = this.filteredList.filter(currentGoal => {
      if (currentGoal.nickname && searchTerm) {
        if (currentGoal.nickname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  orderByNickname(players: Player[]): Player[] {
    if (players) {
      return players.sort((player1, player2) => {
        const nickname1 = player1.nickname.toLowerCase();
        const nickname2 = player2.nickname.toLowerCase();

        if (nickname1 < nickname2) { return -1; }
        if (nickname1 > nickname2) { return 1; }
        return 0;
      });
    }
  }

  async addFriendAlert(player: Player) {
    const alert = await this.alertController.create({
      backdropDismiss: false,
      header: 'Anotar amigo!',
      message: `Vas a anotar a ${player.nickname}.`,
      mode: 'ios',
      buttons: [
        {
          text: 'No, le erré 👎',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.alertPresent = false;
          }
        }, {
          text: 'Si 😀',
          handler: () => {
            this.loadingService.showLoading();
            this.dbService.joinMatch(player, this.matchId)
              .then(() => {
                this.alertPresent = false;
                this.loadingService.hideLoading();
                this.toastService.successToast('Amigo anotado!');
                this.router.navigateByUrl(`match/${this.matchId}`);
              })
              .catch(() => {
                this.alertPresent = false;
                this.toastService.errorToast();
                this.loadingService.hideLoading();
              });
          }
        }
      ]
    });

    await alert.present().then(() => this.alertPresent = true);
  }

}
