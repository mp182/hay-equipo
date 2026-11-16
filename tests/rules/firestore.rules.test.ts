import { readFileSync } from 'node:fs';
import {
  RulesTestContext, RulesTestEnvironment, assertFails, assertSucceeds, initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  Firestore, Timestamp, arrayRemove, arrayUnion, deleteDoc, doc, getDoc, increment, runTransaction,
  serverTimestamp, setDoc, updateDoc, writeBatch
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const ADMIN = 'admin';
const SUPERADMIN = 'superadmin';
const ANA = 'ana';
const BETO = 'beto';
const MATCH = 'matches/m1';
const GOOGLE_PHOTO = 'https://lh3.googleusercontent.com/a/ACg8ocJ-foto=s96-c';

let env: RulesTestEnvironment;

const db = (uid?: string): Firestore =>
  (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore() as unknown as Firestore;

const player = (nickname: string, extra: Record<string, unknown> = {}) => ({
  nickname, roles: ['player'], played: 0, won: 0, image: 'assets/img/playerAvatar.png', googleLogin: true, ...extra
});

const subscriber = (nickname: string, friendOf: string, played = 0, won = 0) => ({
  nickname, image: 'assets/img/playerAvatar.png', played, won, friendOf, lastGames: []
});

/** Lo mismo que hace `DbService.joinMatch`: crea el anotado y lo suma a la lista en una sola escritura. */
function join(firestore: Firestore, playerId: string, data: object) {
  const batch = writeBatch(firestore);
  batch.set(doc(firestore, `${MATCH}/subscribers/${playerId}`), data);
  batch.update(doc(firestore, MATCH), { playersList: arrayUnion(playerId) });
  return batch.commit();
}

/** Lo mismo que hace `DbService.unsubscribe`. */
function leave(firestore: Firestore, playerId: string) {
  const batch = writeBatch(firestore);
  batch.delete(doc(firestore, `${MATCH}/subscribers/${playerId}`));
  batch.update(doc(firestore, MATCH), { playersList: arrayRemove(playerId) });
  return batch.commit();
}

async function seed(fn: (firestore: Firestore) => Promise<unknown>) {
  await env.withSecurityRulesDisabled(async (context: RulesTestContext) => {
    await fn(context.firestore() as unknown as Firestore);
  });
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-hay-equipo',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});

afterAll(() => env?.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await seed(async firestore => {
    await setDoc(doc(firestore, `users/${ADMIN}`), player('Admin', { roles: ['player', 'admin'] }));
    await setDoc(doc(firestore, `users/${SUPERADMIN}`), player('Super', { roles: ['player', 'superadmin'] }));
    await setDoc(doc(firestore, `users/${ANA}`), player('Ana', { played: 20, won: 12 }));
    await setDoc(doc(firestore, `users/${BETO}`), player('Beto', { played: 8, won: 3 }));
    await setDoc(doc(firestore, 'users/amigo'), player('Amigo', { played: 15, won: 5, googleLogin: false, friend: true }));
    await setDoc(doc(firestore, MATCH), {
      date: Timestamp.now(), enabled: true, location: 'La Filial', maxPlayers: 3, playersList: [BETO]
    });
    await setDoc(doc(firestore, `${MATCH}/subscribers/${BETO}`), subscriber('Beto', '', 8, 3));
  });
});

describe('users', () => {
  it('hay que haber iniciado sesión para leer', async () => {
    await assertFails(getDoc(doc(db(), `users/${ANA}`)));
    await assertSucceeds(getDoc(doc(db(BETO), `users/${ANA}`)));
  });

  it('cada uno crea su perfil como jugador, sin estadísticas ni email, con la foto de Google o la de por defecto', async () => {
    await assertSucceeds(setDoc(doc(db('nuevo'), 'users/nuevo'), player('Nuevo')));
    await assertSucceeds(setDoc(doc(db('conFoto'), 'users/conFoto'), player('Con Foto', { image: GOOGLE_PHOTO })));
  });

  it('no se puede crear el perfil con rol de admin, estadísticas, email, otra foto ni para otro', async () => {
    await assertFails(setDoc(doc(db('n1'), 'users/n1'), player('N', { roles: ['player', 'admin'] })));
    await assertFails(setDoc(doc(db('n2'), 'users/n2'), player('N', { played: 999, won: 999 })));
    await assertFails(setDoc(doc(db('n3'), 'users/n3'), player('N', { email: 'n3@example.com' })));
    await assertFails(setDoc(doc(db('n4'), 'users/otro'), player('N')));
    await assertFails(setDoc(doc(db('n5'), 'users/n5'), player('N', { image: 'https://example.com/foto.png' })));
  });

  it('cada uno cambia su apodo y su foto por la de Google', async () => {
    await assertSucceeds(updateDoc(doc(db(ANA), `users/${ANA}`), { nickname: 'Anita' }));
    await assertSucceeds(updateDoc(doc(db(ANA), `users/${ANA}`), { image: GOOGLE_PHOTO }));
  });

  it('nadie se toca sus estadísticas, roles, email ni pone una foto que no sea de Google, ni toca el perfil de otro', async () => {
    await assertFails(updateDoc(doc(db(ANA), `users/${ANA}`), { played: 100 }));
    await assertFails(updateDoc(doc(db(ANA), `users/${ANA}`), { image: 'https://example.com/otra.png' }));
    await assertFails(updateDoc(doc(db(ANA), `users/${ANA}`), { image: 'https://evil.com/x.googleusercontent.com/a' }));
    await assertFails(updateDoc(doc(db(ANA), `users/${BETO}`), { image: GOOGLE_PHOTO }));
    await assertFails(updateDoc(doc(db(ANA), `users/${ANA}`), { roles: ['player', 'admin'] }));
    await assertFails(updateDoc(doc(db(ANA), `users/${ANA}`), { email: 'ana@example.com' }));
    await assertFails(updateDoc(doc(db(ANA), `users/${ANA}`), { nickname: '' }));
    await assertFails(updateDoc(doc(db(ANA), `users/${BETO}`), { nickname: 'Betito' }));
  });

  it('los admins actualizan estadísticas y crean amigos', async () => {
    await assertSucceeds(updateDoc(doc(db(ADMIN), `users/${ANA}`), { played: increment(1), won: increment(1) }));
    await assertSucceeds(setDoc(doc(db(ADMIN), 'users/amigo2'), player('Amigo Dos', { played: 1, won: 1, friend: true })));
  });

  it('no se borran usuarios', async () => {
    await assertFails(deleteDoc(doc(db(ADMIN), `users/${ANA}`)));
  });
});

describe('anotarse', () => {
  it('uno se anota con sus estadísticas reales', async () => {
    await assertSucceeds(join(db(ANA), ANA, subscriber('Ana', '', 20, 12)));
  });

  it('no se puede anotar con estadísticas inventadas', async () => {
    await assertFails(join(db(ANA), ANA, subscriber('Ana', '', 20, 20)));
  });

  it('se puede anotar a un amigo existente o a uno nuevo (con 0 partidos)', async () => {
    await assertSucceeds(join(db(ANA), 'amigo', subscriber('Amigo', ANA, 15, 5)));
    await assertSucceeds(join(db(BETO), 'nuevo', subscriber('Nuevo', BETO)));
  });

  it('un amigo nuevo no puede venir con estadísticas', async () => {
    await assertFails(join(db(BETO), 'nuevo', subscriber('Nuevo', BETO, 30, 30)));
  });

  it('no se puede anotar a otro como si se hubiera anotado solo, ni a nombre de otro', async () => {
    await assertFails(join(db(ANA), 'amigo', subscriber('Amigo', '', 15, 5)));
    await assertFails(join(db(ANA), 'amigo', subscriber('Amigo', BETO, 15, 5)));
  });

  it('no se puede pasar del cupo', async () => {
    await assertSucceeds(join(db(ANA), ANA, subscriber('Ana', '', 20, 12)));
    await assertSucceeds(join(db(ANA), 'amigo', subscriber('Amigo', ANA, 15, 5)));
    await assertFails(join(db(BETO), 'otro', subscriber('Otro', BETO)));
  });

  it('la lista y el anotado van juntos', async () => {
    await assertFails(updateDoc(doc(db(ANA), MATCH), { playersList: arrayUnion(ANA) }));
    await assertFails(setDoc(doc(db(ANA), `${MATCH}/subscribers/${ANA}`), subscriber('Ana', '', 20, 12)));
  });

  it('no se puede anotar en un partido cerrado', async () => {
    await seed(firestore => updateDoc(doc(firestore, MATCH), { enabled: false }));
    await assertFails(join(db(ANA), ANA, subscriber('Ana', '', 20, 12)));
  });

  it('no se pueden agregar varios de una vez ni tocar otros campos del partido', async () => {
    await assertFails(updateDoc(doc(db(ANA), MATCH), { playersList: [BETO, ANA, 'amigo'] }));
    await assertFails(updateDoc(doc(db(ANA), MATCH), { maxPlayers: 30 }));
  });
});

describe('bajarse', () => {
  it('uno se puede bajar solo', async () => {
    await assertSucceeds(leave(db(BETO), BETO));
  });

  it('se puede bajar al amigo que uno anotó', async () => {
    await assertSucceeds(join(db(ANA), 'amigo', subscriber('Amigo', ANA, 15, 5)));
    await assertSucceeds(leave(db(ANA), 'amigo'));
  });

  it('no se puede bajar a otro jugador', async () => {
    await assertFails(leave(db(ANA), BETO));
    await assertFails(updateDoc(doc(db(ANA), MATCH), { playersList: arrayRemove(BETO) }));
  });

  it('un admin puede bajar a cualquiera', async () => {
    await assertSucceeds(leave(db(ADMIN), BETO));
  });

  it('un superadmin (sin rol admin) también puede bajar a cualquiera', async () => {
    await assertSucceeds(join(db(ANA), 'amigo', subscriber('Amigo', ANA, 15, 5)));
    await assertSucceeds(leave(db(SUPERADMIN), BETO));
    await assertSucceeds(leave(db(SUPERADMIN), 'amigo'));
  });
});

describe('partidos, equipos y resultado', () => {
  it('solo los admins crean partidos', async () => {
    const match = { date: Timestamp.now(), enabled: true, location: 'X', maxPlayers: 10, playersList: [] };
    await assertFails(setDoc(doc(db(ANA), 'matches/m2'), match));
    await assertSucceeds(setDoc(doc(db(ADMIN), 'matches/m2'), match));
  });

  it('solo los admins arman los equipos', async () => {
    await assertFails(setDoc(doc(db(BETO), `${MATCH}/teamWhite/${BETO}`), subscriber('Beto', '', 8, 3)));
    await assertSucceeds(setDoc(doc(db(ADMIN), `${MATCH}/teamWhite/${BETO}`), subscriber('Beto', '', 8, 3)));
    await assertFails(setDoc(doc(db(ADMIN), `${MATCH}/otraCosa/${BETO}`), subscriber('Beto', '', 8, 3)));
  });

  it('un admin baja a alguien y lo saca de los equipos en la misma escritura (como `DbService.unsubscribe`)', async () => {
    await seed(firestore => setDoc(doc(firestore, `${MATCH}/teamWhite/${BETO}`), subscriber('Beto', '', 8, 3)));
    const firestore = db(ADMIN);
    const batch = writeBatch(firestore);
    batch.delete(doc(firestore, `${MATCH}/subscribers/${BETO}`));
    batch.update(doc(firestore, MATCH), { playersList: arrayRemove(BETO) });
    batch.delete(doc(firestore, `${MATCH}/teamWhite/${BETO}`));
    batch.delete(doc(firestore, `${MATCH}/teamBlack/${BETO}`));
    await assertSucceeds(batch.commit());
  });

  it('un jugador no puede sacar a nadie de los equipos, ni a sí mismo', async () => {
    await seed(firestore => setDoc(doc(firestore, `${MATCH}/teamWhite/${BETO}`), subscriber('Beto', '', 8, 3)));
    await assertFails(deleteDoc(doc(db(BETO), `${MATCH}/teamWhite/${BETO}`)));
  });

  it('un admin carga el resultado (como `DbService.setWinner`)', async () => {
    const firestore = db(ADMIN);
    await assertSucceeds(runTransaction(firestore, async transaction => {
      await transaction.get(doc(firestore, MATCH));
      await transaction.get(doc(firestore, `users/${BETO}`));
      transaction.update(doc(firestore, `users/${BETO}`), { played: increment(1), won: increment(1), lastGames: ['G'] });
      transaction.update(doc(firestore, MATCH), { enabled: false });
    }));
  });

  it('un jugador no puede cerrar el partido', async () => {
    await assertFails(updateDoc(doc(db(BETO), MATCH), { enabled: false }));
  });
});

describe('nueva temporada', () => {
  /** Lo mismo que hace `DbService.startNewSeason`: anota la fecha y divide los partidos en el mismo batch. */
  function startSeason(firestore: Firestore, uid: string) {
    const batch = writeBatch(firestore);
    batch.set(doc(firestore, 'config/season'), { startedAt: serverTimestamp(), startedBy: uid });
    batch.update(doc(firestore, `users/${ANA}`), { played: 10, won: 6 });
    return batch.commit();
  }

  it('un admin arranca la temporada', async () => {
    await assertSucceeds(startSeason(db(ADMIN), ADMIN));
  });

  it('no se puede arrancar dos veces el mismo día, y entonces no se divide nada', async () => {
    await assertSucceeds(startSeason(db(ADMIN), ADMIN));
    await assertFails(startSeason(db(SUPERADMIN), SUPERADMIN));
  });

  it('se puede arrancar otra si la anterior empezó hace más de un día', async () => {
    await seed(firestore => setDoc(doc(firestore, 'config/season'), {
      startedAt: Timestamp.fromMillis(Date.now() - 2 * 24 * 60 * 60 * 1000), startedBy: ADMIN
    }));
    await assertSucceeds(startSeason(db(ADMIN), ADMIN));
  });

  it('un jugador no la arranca, ni se puede inventar la fecha ni quién la arrancó', async () => {
    await assertFails(setDoc(doc(db(ANA), 'config/season'), { startedAt: serverTimestamp(), startedBy: ANA }));
    await assertFails(setDoc(doc(db(ADMIN), 'config/season'), { startedAt: Timestamp.now(), startedBy: ADMIN }));
    await assertFails(setDoc(doc(db(ADMIN), 'config/season'), { startedAt: serverTimestamp(), startedBy: ANA }));
  });
});
