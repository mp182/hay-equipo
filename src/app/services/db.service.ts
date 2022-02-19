import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Match } from '../models/match.interface';
import { AngularFirestore } from '@angular/fire/firestore';
import { Player } from '../models/player.interface';
import { map } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { titleCase } from './../helpers/string.helpers';
import { News } from '../models/news.interface';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(
    private afs: AngularFirestore,
    private authService: AuthenticationService
  ) { }

  getEnabledMatches(): Observable<Match[]> {
    return this.afs.collection<Match>('matches', ref => ref.where('enabled', '==', true)).snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  async joinMatch(player: Player, matchId: string) {
    const arrayUnion = firebase.default.firestore.FieldValue.arrayUnion;
    const UID = (await this.authService.userDetails()).uid;
    return [
      this.afs.collection('matches').doc(matchId).collection('subscribers').doc(player.id).set({
        nickname: player.nickname,
        image: player.image,
        played: player.played,
        won: player.won,
        friendOf: UID === player.id ? '' : UID,
        lastGames: player.lastGames ?? []
      }),
      this.afs.doc(`matches/${matchId}`).update({ playersList: arrayUnion(player.id) })
    ];
  }

  getMatch(matchId: string): Observable<Match> {
    return this.afs.doc<Match>(`matches/${matchId}`).valueChanges();
  }

  getSubscribers(matchId: string): Observable<Player[]> {
    return this.afs.collection<Player>(`matches/${matchId}/subscribers`).snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  unsubscribe(playerId: string, matchId: string) {
    const arrayRemove = firebase.default.firestore.FieldValue.arrayRemove;

    return [
      this.afs.doc(`matches/${matchId}/subscribers/${playerId}`).delete(),
      this.afs.doc(`matches/${matchId}`).update({ playersList: arrayRemove(playerId) })
    ];
  }

  updateNickname(nickname: string, playerId: string) {
    return this.afs.doc(`users/${playerId}`).update({ nickname });
  }

  addMatch(date: Date, maxPlayers: number, location: string) {
    return this.afs.collection('matches').add({
      date,
      enabled: true,
      location,
      maxPlayers,
      playersList: []
    });
  }

  addNews(news: string) {
    return this.afs.collection('card-news').add({ description: news });
  }

  updateImage(imgURL: string, playerId: string) {
    return this.afs.doc(`users/${playerId}`).update({ image: imgURL });
  }

  setTeams(matchId: string, teamWhite: Player[], teamBlack: Player[]) {
    teamWhite.forEach(player => {
      this.afs.collection('matches').doc(matchId).collection('teamWhite').doc(player.id).set(player);
    });

    teamBlack.forEach(player => {
      this.afs.collection('matches').doc(matchId).collection('teamBlack').doc(player.id).set(player);
    });
  }

  getTeamWhite(matchId: string): Observable<Player[]> {
    return this.afs.collection<Player>(`matches/${matchId}/teamWhite`).snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  getTeamBlack(matchId: string): Observable<Player[]> {
    return this.afs.collection<Player>(`matches/${matchId}/teamBlack`).snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  setWinner(matchId: string, team: string, teamWhite: Player[], teamBlack: Player[]) {
    if (team === 'white') {
      teamWhite.forEach(player => {
        this.updatePlayerScore(player, true);
      });
      teamBlack.forEach(player => {
        this.updatePlayerScore(player, false);
      });
    } else {
      teamBlack.forEach(player => {
        this.updatePlayerScore(player, true);
      });
      teamWhite.forEach(player => {
        this.updatePlayerScore(player, false);
      });
    }

    return this.afs.doc(`matches/${matchId}`).update({ enabled: false });
  }

  private updatePlayerScore(player: any, win: boolean) {
    if (win) {
      if (player.lastGames) {
        if (player.lastGames?.length === 5) {
          player.lastGames.pop();
        }
      } else {
        player.lastGames = [];
      }

      player.lastGames.unshift('G');

      this.afs.doc(`users/${player.id}`).update(
        {
          won: player.won + 1,
          played: player.played + 1,
          lastGames: player.lastGames
        }
      )
        .catch(err => {
          if (err.code === 'not-found') {
            this.authService.saveFriendUser(player, true);
          } else {
            console.log(err.code);
          }
        });
    } else {
      if (player.lastGames) {
        if (player.lastGames?.length === 5) {
          player.lastGames.pop();
        }
      } else {
        player.lastGames = [];
      }

      player.lastGames.unshift('P');

      this.afs.doc(`users/${player.id}`).update(
        {
          played: player.played + 1,
          lastGames: player.lastGames
        }
      )
        .catch(err => {
          if (err.code === 'not-found') {
            this.authService.saveFriendUser(player, false);
          } else {
            console.log(err.code);
          }
        });
    }
  }

  getNews(): Observable<any> {
    return this.afs.collection('news').valueChanges();
  }

  getCardNews(): Observable<News[]> {
    return this.afs.collection<News>('card-news').snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  getPlayers(): Observable<Player[]> {
    return this.afs.collection<Player>('users', ref => ref.where('played', '>', 10)).valueChanges();
  }

  getFriends(): Observable<Player[]> {
    return this.afs.collection<Player>('users', ref => ref.where('friend', '==', true)).snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  getAllPlayers(): Observable<Player[]> {
    return this.afs.collection<Player>('users').snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  addNewFriend(matchId: string, nickname: string) {
    const player = {
      id: this.afs.createId(),
      nickname: titleCase(nickname),
      played: 0,
      won: 0,
      image: '../../../assets/img/playerAvatar.png',
      email: '',
      roles: [],
      googleLogin: false,
      lastGames: []
    };
    return this.joinMatch(player, matchId);
  }

  deleteCardNews(newsId: string) {
    return this.afs.doc(`card-news/${newsId}`).delete();
  }

  updatePlayerStats(player: Player) {
    if (player.played > 0 && player.won > 0) {
      const newPlayed = player.played <= 1 ? 0 : Math.floor(player.played / 2);
      const newWon = player.won <= 1 ? 0 : Math.floor(player.won / 2);
      this.afs.doc(`users/${player.id}`).update({ played: newPlayed, won: newWon });
    }
  }

  startNewSeason(players: Player[]) {
    players.forEach(player => {
      this.updatePlayerStats(player);
    });
  }

  updateMatch(matchId: string) {
    return this.afs.doc(`matches/${matchId}`).update({ enabled: false });
  }

  deleteFromTeam(playerId: string, matchId: string, team: string) {
    return this.afs.doc(`matches/${matchId}/${team}/${playerId}/`).delete();
  }

  addToTeam(player: Player, matchId: string, team: string) {
    return this.afs.collection('matches').doc(matchId).collection(team).doc(player.id).set(player);
  }

  getVersion(): Observable<string> {
    return this.afs.collection<{ version: string }>('version')
      .valueChanges()
      .pipe(
        map(version => version[0].version)
      );
  }

}
