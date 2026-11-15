import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Firestore, addDoc, arrayRemove, arrayUnion, collection, collectionData, deleteDoc, doc, docData,
  query, setDoc, updateDoc, where, writeBatch
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

import { Match } from '../models/match.interface';
import { News } from '../models/news.interface';
import { Player } from '../models/player.interface';
import { AuthenticationService, DEFAULT_AVATAR } from './authentication.service';
import { titleCase } from '../helpers/string.helpers';

export type Team = 'teamWhite' | 'teamBlack';

@Injectable({ providedIn: 'root' })
export class DbService {

  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);
  private readonly authService = inject(AuthenticationService);

  // ---------- Partidos ----------

  getEnabledMatches(): Observable<Match[]> {
    return this.run(() => collectionData(
      query(collection(this.firestore, 'matches'), where('enabled', '==', true)),
      { idField: 'id' }
    )) as Observable<Match[]>;
  }

  getMatch(matchId: string): Observable<Match> {
    return this.run(() => docData(doc(this.firestore, `matches/${matchId}`), { idField: 'id' })) as Observable<Match>;
  }

  addMatch(date: Date, maxPlayers: number, location: string) {
    return this.run(() => addDoc(collection(this.firestore, 'matches'), {
      date,
      enabled: true,
      location,
      maxPlayers,
      playersList: []
    }));
  }

  /** Marca el partido como terminado (o suspendido). */
  updateMatch(matchId: string) {
    return this.run(() => updateDoc(doc(this.firestore, `matches/${matchId}`), { enabled: false }));
  }

  // ---------- Anotados ----------

  getSubscribers(matchId: string): Observable<Player[]> {
    return this.run(() => collectionData(
      collection(this.firestore, `matches/${matchId}/subscribers`), { idField: 'id' }
    )) as Observable<Player[]>;
  }

  async joinMatch(player: Player, matchId: string): Promise<void> {
    const uid = (await this.authService.userDetails())?.uid;
    await Promise.all([
      this.run(() => setDoc(doc(this.firestore, `matches/${matchId}/subscribers/${player.id}`), {
        nickname: player.nickname,
        image: player.image,
        played: player.played,
        won: player.won,
        friendOf: uid === player.id ? '' : uid,
        lastGames: player.lastGames ?? []
      })),
      this.run(() => updateDoc(doc(this.firestore, `matches/${matchId}`), { playersList: arrayUnion(player.id) }))
    ]);
  }

  async unsubscribe(playerId: string, matchId: string): Promise<void> {
    await Promise.all([
      this.run(() => deleteDoc(doc(this.firestore, `matches/${matchId}/subscribers/${playerId}`))),
      this.run(() => updateDoc(doc(this.firestore, `matches/${matchId}`), { playersList: arrayRemove(playerId) }))
    ]);
  }

  addNewFriend(matchId: string, nickname: string) {
    const player: Player = {
      id: this.run(() => doc(collection(this.firestore, 'users')).id),
      nickname: titleCase(nickname),
      played: 0,
      won: 0,
      image: DEFAULT_AVATAR,
      email: '',
      roles: [],
      googleLogin: false,
      lastGames: []
    };
    return this.joinMatch(player, matchId);
  }

  // ---------- Equipos ----------

  getTeam(matchId: string, team: Team): Observable<Player[]> {
    return this.run(() => collectionData(
      collection(this.firestore, `matches/${matchId}/${team}`), { idField: 'id' }
    )) as Observable<Player[]>;
  }

  getTeamWhite(matchId: string): Observable<Player[]> {
    return this.getTeam(matchId, 'teamWhite');
  }

  getTeamBlack(matchId: string): Observable<Player[]> {
    return this.getTeam(matchId, 'teamBlack');
  }

  setTeams(matchId: string, teamWhite: Player[], teamBlack: Player[]) {
    return this.run(() => {
      const batch = writeBatch(this.firestore);
      teamWhite.forEach(player => batch.set(doc(this.firestore, `matches/${matchId}/teamWhite/${player.id}`), player));
      teamBlack.forEach(player => batch.set(doc(this.firestore, `matches/${matchId}/teamBlack/${player.id}`), player));
      return batch.commit();
    });
  }

  deleteFromTeam(playerId: string, matchId: string, team: Team) {
    return this.run(() => deleteDoc(doc(this.firestore, `matches/${matchId}/${team}/${playerId}`)));
  }

  addToTeam(player: Player, matchId: string, team: Team) {
    return this.run(() => setDoc(doc(this.firestore, `matches/${matchId}/${team}/${player.id}`), player));
  }

  async setWinner(matchId: string, team: 'white' | 'black', teamWhite: Player[], teamBlack: Player[]) {
    const whiteWon = team === 'white';
    await Promise.all([
      ...teamWhite.map(player => this.updatePlayerScore(player, whiteWon)),
      ...teamBlack.map(player => this.updatePlayerScore(player, !whiteWon)),
    ]);
    return this.updateMatch(matchId);
  }

  private async updatePlayerScore(player: Player, win: boolean) {
    const lastGames = [win ? 'G' : 'P', ...(player.lastGames ?? [])].slice(0, 5);
    const changes = win
      ? { won: player.won + 1, played: player.played + 1, lastGames }
      : { played: player.played + 1, lastGames };

    try {
      await this.run(() => updateDoc(doc(this.firestore, `users/${player.id}`), changes));
    } catch (err: any) {
      if (err?.code === 'not-found') {
        // Es un "amigo" que todavía no tiene documento en `users`: lo creamos.
        await this.authService.saveFriendUser({ ...player, lastGames }, win);
      } else {
        console.error(err?.code ?? err);
      }
    }
  }

  // ---------- Jugadores ----------

  updateNickname(nickname: string, playerId: string) {
    return this.run(() => updateDoc(doc(this.firestore, `users/${playerId}`), { nickname }));
  }

  /** Jugadores que entran en el ranking (más de 10 partidos jugados). */
  getPlayers(): Observable<Player[]> {
    return this.run(() => collectionData(
      query(collection(this.firestore, 'users'), where('played', '>', 10)), { idField: 'id' }
    )) as Observable<Player[]>;
  }

  getFriends(): Observable<Player[]> {
    return this.run(() => collectionData(
      query(collection(this.firestore, 'users'), where('friend', '==', true)), { idField: 'id' }
    )) as Observable<Player[]>;
  }

  getAllPlayers(): Observable<Player[]> {
    return this.run(() => collectionData(collection(this.firestore, 'users'), { idField: 'id' })) as Observable<Player[]>;
  }

  /** Nueva temporada: a cada jugador le quedan la mitad de los partidos jugados y ganados. */
  startNewSeason(players: Player[]) {
    return Promise.all(players
      .filter(player => player.played > 0 && player.won > 0)
      .map(player => this.run(() => updateDoc(doc(this.firestore, `users/${player.id}`), {
        played: player.played <= 1 ? 0 : Math.floor(player.played / 2),
        won: player.won <= 1 ? 0 : Math.floor(player.won / 2)
      }))));
  }

  // ---------- Novedades y versión ----------

  getNews(): Observable<News[]> {
    return this.run(() => collectionData(collection(this.firestore, 'news'), { idField: 'id' })) as Observable<News[]>;
  }

  getCardNews(): Observable<News[]> {
    return this.run(() => collectionData(collection(this.firestore, 'card-news'), { idField: 'id' })) as Observable<News[]>;
  }

  addNews(description: string) {
    return this.run(() => addDoc(collection(this.firestore, 'card-news'), { description }));
  }

  deleteCardNews(newsId: string) {
    return this.run(() => deleteDoc(doc(this.firestore, `card-news/${newsId}`)));
  }

  /** Versión publicada de la app (colección `version`). `undefined` si no está cargada. */
  getVersion(): Observable<string | undefined> {
    return (this.run(() => collectionData(collection(this.firestore, 'version'))) as Observable<{ version: string }[]>)
      .pipe(map(versions => versions[0]?.version));
  }

  /** AngularFire pide que las llamadas a Firebase se hagan dentro de un contexto de inyección. */
  private run<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }

}
