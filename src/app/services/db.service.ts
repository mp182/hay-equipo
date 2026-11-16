import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Firestore, addDoc, arrayRemove, arrayUnion, collection, collectionData, deleteDoc, doc, docData, getDocsFromServer, increment,
  query, runTransaction, serverTimestamp, updateDoc, where, writeBatch, Timestamp
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

import { Match } from '../models/match.interface';
import { News } from '../models/news.interface';
import { Player } from '../models/player.interface';
import { AuthenticationService, DEFAULT_AVATAR } from './authentication.service';
import { MIN_GAMES_FOR_RANKING } from '../helpers/score.helpers';
import { titleCase } from '../helpers/string.helpers';
import { teamsOutOfDate } from '../helpers/teams.helpers';

export type Team = 'teamWhite' | 'teamBlack';

const TEAMS: Team[] = ['teamWhite', 'teamBlack'];

/** Se lanza al cargar el resultado si los equipos no coinciden con los anotados: hay que volver a armarlos. */
export class TeamsOutOfDateError extends Error {
  constructor() {
    super('Los equipos no coinciden con los anotados');
    this.name = 'TeamsOutOfDateError';
  }
}

/** Se lanza al querer anotar a alguien en un partido que ya está completo. */
export class MatchFullError extends Error {
  constructor() {
    super('El partido ya está completo');
    this.name = 'MatchFullError';
  }
}

/** Se lanza al cargar el resultado de un partido que ya estaba cerrado. */
export class MatchClosedError extends Error {
  constructor() {
    super('El partido ya estaba cerrado');
    this.name = 'MatchClosedError';
  }
}

/** Firestore admite hasta 500 escrituras por batch. */
const BATCH_LIMIT = 500;

/** Documento con la fecha en que empezó la temporada actual. */
const SEASON_PATH = 'config/season';

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

  /**
   * Anota al jugador en el partido. Usa una transacción para no pasarse del cupo
   * aunque se anoten varios a la vez (lanza `MatchFullError` si no hay lugar).
   */
  async joinMatch(player: Player, matchId: string): Promise<void> {
    const uid = (await this.authService.userDetails())?.uid;
    const matchRef = this.run(() => doc(this.firestore, `matches/${matchId}`));
    const subscriberRef = this.run(() => doc(this.firestore, `matches/${matchId}/subscribers/${player.id}`));
    // Los helpers de AngularFire se arman acá: dentro de la transacción ya no hay contexto de inyección.
    const addToList = this.run(() => arrayUnion(player.id));

    await this.run(() => runTransaction(this.firestore, async transaction => {
      const match = (await transaction.get(matchRef)).data() as Match | undefined;
      const playersList = match?.playersList ?? [];
      if (playersList.includes(player.id)) {
        return;
      }
      if (!match || playersList.length >= +match.maxPlayers) {
        throw new MatchFullError();
      }
      transaction.set(subscriberRef, {
        nickname: player.nickname,
        image: player.image,
        played: player.played,
        won: player.won,
        friendOf: uid === player.id ? '' : uid,
        lastGames: player.lastGames ?? []
      });
      transaction.update(matchRef, { playersList: addToList });
    }));
  }

  /**
   * Baja al jugador del partido. Con `removeFromTeams` (solo admins: las reglas no dejan a los demás tocar los equipos)
   * también lo saca de los equipos ya armados, para que no le cuente el resultado.
   */
  unsubscribe(playerId: string, matchId: string, removeFromTeams = false): Promise<void> {
    return this.run(() => {
      const batch = writeBatch(this.firestore);
      batch.delete(doc(this.firestore, `matches/${matchId}/subscribers/${playerId}`));
      batch.update(doc(this.firestore, `matches/${matchId}`), { playersList: arrayRemove(playerId) });
      if (removeFromTeams) {
        TEAMS.forEach(team => batch.delete(doc(this.firestore, `matches/${matchId}/${team}/${playerId}`)));
      }
      return batch.commit();
    });
  }

  addNewFriend(matchId: string, nickname: string) {
    const player: Player = {
      id: this.run(() => doc(collection(this.firestore, 'users')).id),
      nickname: titleCase(nickname),
      played: 0,
      won: 0,
      image: DEFAULT_AVATAR,
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

  /**
   * Arma los equipos desde cero: borra los que hubiera (por ejemplo, de antes de que alguien se bajara)
   * y guarda los nuevos, todo en una escritura.
   */
  async setTeams(matchId: string, teamWhite: Player[], teamBlack: Player[]) {
    const previous = await Promise.all(TEAMS.map(team =>
      this.run(() => getDocsFromServer(collection(this.firestore, `matches/${matchId}/${team}`)))));
    return this.run(() => {
      const batch = writeBatch(this.firestore);
      previous.forEach(snapshot => snapshot.docs.forEach(player => batch.delete(player.ref)));
      teamWhite.forEach(player => batch.set(doc(this.firestore, `matches/${matchId}/teamWhite/${player.id}`), player));
      teamBlack.forEach(player => batch.set(doc(this.firestore, `matches/${matchId}/teamBlack/${player.id}`), player));
      return batch.commit();
    });
  }

  /** Pasa jugadores de un equipo al otro en una sola escritura. */
  moveBetweenTeams(matchId: string, toWhite: Player[], toBlack: Player[]) {
    return this.run(() => {
      const batch = writeBatch(this.firestore);
      toWhite.forEach(player => {
        batch.delete(doc(this.firestore, `matches/${matchId}/teamBlack/${player.id}`));
        batch.set(doc(this.firestore, `matches/${matchId}/teamWhite/${player.id}`), player);
      });
      toBlack.forEach(player => {
        batch.delete(doc(this.firestore, `matches/${matchId}/teamWhite/${player.id}`));
        batch.set(doc(this.firestore, `matches/${matchId}/teamBlack/${player.id}`), player);
      });
      return batch.commit();
    });
  }

  /**
   * Carga el resultado y cierra el partido, todo en una transacción:
   * si el partido ya estaba cerrado (doble tap, dos admins a la vez) lanza `MatchClosedError`, y si los equipos
   * no coinciden con los anotados lanza `TeamsOutOfDateError`; en los dos casos no suma nada.
   * Las estadísticas se leen del documento actual del jugador (no de la copia del equipo) y se suman con `increment`.
   */
  setWinner(matchId: string, team: 'white' | 'black', teamWhite: Player[], teamBlack: Player[]) {
    const whiteWon = team === 'white';
    const results = [
      ...teamWhite.map(player => ({ player, win: whiteWon })),
      ...teamBlack.map(player => ({ player, win: !whiteWon })),
    ];
    const matchRef = this.run(() => doc(this.firestore, `matches/${matchId}`));
    const userRefs = results.map(({ player }) => this.run(() => doc(this.firestore, `users/${player.id}`)));
    // Los helpers de AngularFire se arman acá: dentro de la transacción ya no hay contexto de inyección.
    const plusOne = this.run(() => increment(1));
    const plusZero = this.run(() => increment(0));

    return this.run(() => runTransaction(this.firestore, async transaction => {
      // En una transacción todas las lecturas van antes que las escrituras.
      const match = await transaction.get(matchRef);
      if (!match.exists() || match.data()['enabled'] === false) {
        throw new MatchClosedError();
      }
      // Solo cuenta para los que están anotados ahora: si los equipos quedaron viejos, no se suma nada.
      if (teamsOutOfDate(match.data()['playersList'] ?? [], teamWhite, teamBlack)) {
        throw new TeamsOutOfDateError();
      }
      const snapshots = await Promise.all(userRefs.map(ref => transaction.get(ref)));

      results.forEach(({ player, win }, i) => {
        const snapshot = snapshots[i];
        const result = win ? 'G' : 'P';
        if (snapshot.exists()) {
          const previous = (snapshot.data()['lastGames'] as string[] | undefined) ?? [];
          transaction.update(snapshot.ref, {
            played: plusOne,
            won: win ? plusOne : plusZero,
            lastGames: [result, ...previous].slice(0, 5)
          });
        } else {
          // Es un "amigo" que todavía no tiene documento en `users`: lo creamos.
          transaction.set(userRefs[i], {
            nickname: titleCase(player.nickname),
            roles: ['player'],
            played: 1,
            won: win ? 1 : 0,
            image: DEFAULT_AVATAR,
            googleLogin: false,
            friend: true,
            lastGames: [result]
          });
        }
      });

      transaction.update(matchRef, { enabled: false });
    }));
  }

  // ---------- Jugadores ----------

  updateNickname(nickname: string, playerId: string) {
    return this.run(() => updateDoc(doc(this.firestore, `users/${playerId}`), { nickname }));
  }

  /** Jugadores que entran en el ranking: los que ya tienen promedio propio (ver `playerScore`). */
  getPlayers(): Observable<Player[]> {
    return this.run(() => collectionData(
      query(collection(this.firestore, 'users'), where('played', '>=', MIN_GAMES_FOR_RANKING)), { idField: 'id' }
    )) as Observable<Player[]>;
  }

  getFriends(): Observable<Player[]> {
    return this.run(() => collectionData(
      query(collection(this.firestore, 'users'), where('friend', '==', true)), { idField: 'id' }
    )) as Observable<Player[]>;
  }

  /** Cuándo empezó la temporada actual (`undefined` si nunca se arrancó una desde la app). */
  getSeasonStart(): Observable<Date | undefined> {
    return (this.run(() => docData(doc(this.firestore, SEASON_PATH))) as Observable<{ startedAt?: Timestamp } | undefined>)
      .pipe(map(season => season?.startedAt?.toDate()));
  }

  /**
   * Nueva temporada: a cada jugador le quedan la mitad de los partidos jugados y ganados.
   * Lee los jugadores directo del servidor: la primera respuesta de un listener puede venir de la caché local
   * (con solo el jugador logueado) y la temporada se aplicaría a medias.
   *
   * El primer batch también anota la fecha en `config/season`, y las reglas no dejan anotarla de nuevo hasta
   * el día siguiente: si se aprieta dos veces o la arrancan dos admins a la vez, el segundo batch se rechaza
   * entero y no se dividen los partidos dos veces.
   */
  async startNewSeason() {
    const snapshot = await this.run(() => getDocsFromServer(collection(this.firestore, 'users')));
    const toUpdate = snapshot.docs.filter(player => (player.data()['played'] ?? 0) > 0);
    const uid = (await this.authService.userDetails())?.uid;

    // El primer batch lleva una escritura menos de jugadores: la de la fecha de la temporada.
    let start = 0;
    let first = true;
    while (first || start < toUpdate.length) {
      const size = first ? BATCH_LIMIT - 1 : BATCH_LIMIT;
      const players = toUpdate.slice(start, start + size);
      const markSeason = first;
      await this.run(() => {
        const batch = writeBatch(this.firestore);
        if (markSeason) {
          batch.set(doc(this.firestore, SEASON_PATH), { startedAt: serverTimestamp(), startedBy: uid });
        }
        players.forEach(player => batch.update(player.ref, {
          played: Math.floor(player.data()['played'] / 2),
          won: Math.floor((player.data()['won'] ?? 0) / 2)
        }));
        return batch.commit();
      });
      start += size;
      first = false;
    }
  }

  // ---------- Novedades del dashboard ----------

  getCardNews(): Observable<News[]> {
    return this.run(() => collectionData(collection(this.firestore, 'card-news'), { idField: 'id' })) as Observable<News[]>;
  }

  addNews(description: string) {
    return this.run(() => addDoc(collection(this.firestore, 'card-news'), { description }));
  }

  deleteCardNews(newsId: string) {
    return this.run(() => deleteDoc(doc(this.firestore, `card-news/${newsId}`)));
  }

  /** AngularFire pide que las llamadas a Firebase se hagan dentro de un contexto de inyección. */
  private run<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }

}
