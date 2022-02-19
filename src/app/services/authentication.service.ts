import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Platform } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { Player } from '../models/player.interface';
import { switchMap, map } from 'rxjs/operators';
import { LoadingService } from './loading.service';
import { titleCase } from './../helpers/string.helpers';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  player$: Observable<Player>;

  constructor(
    private loadingService: LoadingService,
    private afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    private platform: Platform
  ) {
    this.player$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<Player>(`users/${user.uid}`).valueChanges()
            .pipe(
              map(data => {
                const id = user.uid;
                return { id, ...data };
              })
            );
        } else {
          return of(null);
        }
      })
    );
  }

  registerUser(value: { email: string; password: string; nickname: string; }) {
    this.loadingService.showLoading();

    return new Promise<any>((resolve, reject) => {
      this.afAuth.createUserWithEmailAndPassword(value.email, value.password)
        .then(
          res => {
            const data = {
              nickname: titleCase(value.nickname),
              roles: ['player'],
              played: 0,
              won: 0,
              image: '../../../assets/img/playerAvatar.png',
              email: value.email,
              googleLogin: false,
            };
            this.afs.collection('users').doc(res.user.uid).set(data);
            this.loadingService.hideLoading();
            return resolve(res);
          },
          err => {
            this.loadingService.hideLoading();
            return reject(err);
          });
    });
  }

  loginUser(value: { email: string; password: string; }) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.signInWithEmailAndPassword(value.email, value.password)
        .then(
          res => resolve(res),
          err => reject(err)
        );
    });
  }

  logoutUser() {
    return this.afAuth.signOut();
  }

  userDetails() {
    return this.afAuth.currentUser;
  }

  resetPassword(value: { email: string; }) {
    return this.afAuth.sendPasswordResetEmail(value.email);
  }

  async loginWithGoogle() {
    this.platform.ready().then(async () => {
      const userCredential = await this.afAuth.signInWithPopup(new firebase.default.auth.GoogleAuthProvider());
      if (userCredential.additionalUserInfo.isNewUser) {
        const data = {
          nickname: titleCase(userCredential.user.displayName.split(' ')[0]),
          roles: ['player'],
          played: 0,
          won: 0,
          image: userCredential.user.photoURL,
          email: userCredential.user.email,
          googleLogin: true
        };
        this.afs.collection('users').doc(userCredential.user.uid).set(data);
      }
    });
  }

  saveFriendUser(player: Player, win: boolean) {
    const data = {
      nickname: titleCase(player.nickname),
      roles: ['player'],
      played: 1,
      won: win ? 1 : 0,
      image: '../../../assets/img/playerAvatar.png',
      googleLogin: false,
      friend: true
    };

    this.afs.collection('users').doc(player.id).set(data);
  }

}
