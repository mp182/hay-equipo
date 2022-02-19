import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DbService } from 'src/app/services/db.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Player } from 'src/app/models/player.interface';
import { ToastService } from 'src/app/services/toast.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-image',
  templateUrl: './edit-image.page.html',
  styleUrls: ['./edit-image.page.scss'],
})
export class EditImagePage {

  selectedFiles: any;
  player$: Observable<Player>;
  downloadURL: Observable<string>;
  subscription: Subscription;
  imageSubscription: Subscription;
  playerSubscription: Subscription;
  loading = false;

  constructor(
    private auth: AuthenticationService,
    private db: DbService,
    private loadingService: LoadingService,
    private router: Router,
    private storage: AngularFireStorage,
    private toastService: ToastService
  ) { }

  ionViewWillEnter() {
    this.loading = false;
    this.loadingService.showLoading();
    this.player$ = this.auth.player$;
  }

  ionViewDidEnter() {
    this.loadingService.hideLoading();
  }

  ionViewWillLeave() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.imageSubscription) { this.imageSubscription.unsubscribe(); }
    if (this.playerSubscription) { this.playerSubscription.unsubscribe(); }
  }

  detectFiles(event: any) {
    this.selectedFiles = event.target.files;
  }

  uploadSingle(playerId: string) {
    const file = this.selectedFiles.item(0);
    this.updateImageFromFile(file, playerId);
  }

  updateImageFromFile(file: any, playerId: string) {
    this.loading = true;

    const filePath = playerId + '.jpg';

    const fileRef = this.storage.ref(filePath);

    const task = fileRef.put(file);

    this.subscription = task.snapshotChanges().pipe(
      finalize(() => {
        this.playerSubscription = this.player$.subscribe(player => {
          setTimeout(() => {
            const fileNewRef = this.storage.ref(`${playerId}.jpg`);
            this.downloadURL = fileNewRef.getDownloadURL();
            this.imageSubscription = this.downloadURL.subscribe(resp => {
              this.db.updateImage(resp, player.id);
              this.toastService.successToast('Cambiaste tu avatar!');
              this.router.navigateByUrl('dashboard');
            });
          }, 15000);
        });
      })
    ).subscribe();
  }

  async takePicture(playerId: string) {
    const originalPhoto = await Camera.getPhoto({
      quality: 50,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });

    this.uploadFileFromCam(originalPhoto, playerId);
  }

  uploadFileFromCam(image: Photo, playerId: string) {
    this.loading = true;

    const filePath = `${playerId}`;

    const fileRef = this.storage.ref(filePath);

    const task = fileRef.putString(image.base64String, 'base64');

    this.subscription = task.snapshotChanges().pipe(
      finalize(() => {
        this.playerSubscription = this.player$.subscribe(player => {
          setTimeout(() => {
            const fileNewRef = this.storage.ref(`${playerId}`);
            this.downloadURL = fileNewRef.getDownloadURL();
            this.imageSubscription = this.downloadURL.subscribe(resp => {
              this.db.updateImage(resp, player.id);
              this.toastService.successToast('Cambiaste tu avatar!');
              this.router.navigateByUrl('dashboard');
            });
          }, 15000);
        });
      })
    ).subscribe();
  }

}
