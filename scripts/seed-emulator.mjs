// Carga datos de prueba en el emulador de Firestore (`npm run emulators:seed`).
// Antes: `npm run emulators`, `npm run start:emulators` e ingresar a la app con una cuenta de prueba.
// Esa cuenta (y cualquier otra que ya haya entrado) queda como admin.
//
// Arma un partido de 10 jugadores con 8 amigos anotados, pensado para probar el cupo, el armado de equipos,
// la carga del resultado y la nueva temporada. Solo habla con el emulador (proyecto demo-hay-equipo).

const BASE = 'http://127.0.0.1:8080/v1/projects/demo-hay-equipo/databases/(default)/documents';
const HEADERS = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
const AVATAR = 'assets/img/playerAvatar.png';

const toValue = x => typeof x === 'string' ? { stringValue: x }
  : typeof x === 'boolean' ? { booleanValue: x }
  : typeof x === 'number' ? { integerValue: String(x) }
  : x instanceof Date ? { timestampValue: x.toISOString() }
  : Array.isArray(x) ? { arrayValue: { values: x.map(toValue) } }
  : null;

const toFields = data => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, toValue(value)]));

async function request(path, init) {
  const response = await fetch(`${BASE}/${path}`, { headers: HEADERS, ...init });
  if (!response.ok) {
    throw new Error(`${path}: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

const put = (path, data, mask) => request(
  path + (mask ? '?' + mask.map(f => `updateMask.fieldPaths=${f}`).join('&') : ''),
  { method: 'PATCH', body: JSON.stringify({ fields: toFields(data) }) }
);

const { documents = [] } = await request('users?pageSize=100').catch(err => {
  console.error('No se pudo conectar con el emulador de Firestore. ¿Corriste `npm run emulators`?');
  throw err;
});
const accounts = documents.filter(d => d.fields?.googleLogin?.booleanValue).map(d => d.name.split('/').pop());
if (accounts.length === 0) {
  console.warn('Todavía no entró nadie a la app: los datos se cargan igual, pero no va a haber ningún admin.');
}
for (const uid of accounts) {
  await put(`users/${uid}`, { roles: ['player', 'admin', 'superadmin'], played: 20, won: 14, lastGames: ['G', 'G'] },
    ['roles', 'played', 'won', 'lastGames']);
}

// f1..f5 tienen perfil, con estadísticas distintas a las del anotado (para ver que el resultado se suma
// sobre el perfil); f6..f8 no tienen, y se crean al cargar el resultado.
const friends = [
  { id: 'f1', nickname: 'Ceroganador', played: 12, won: 0, profile: { played: 30, won: 3 } },
  { id: 'f2', nickname: 'Crack', played: 20, won: 18, profile: { played: 25, won: 20 } },
  { id: 'f3', nickname: 'Bueno', played: 20, won: 12, profile: { played: 20, won: 12 } },
  { id: 'f4', nickname: 'Medio', played: 20, won: 10, profile: { played: 20, won: 10 } },
  { id: 'f5', nickname: 'Flojo', played: 20, won: 4, profile: { played: 20, won: 4 } },
  { id: 'f6', nickname: 'Nuevo Uno', played: 0, won: 0 },
  { id: 'f7', nickname: 'Nuevo Dos', played: 0, won: 0 },
  { id: 'f8', nickname: 'Nuevo Tres', played: 0, won: 0 },
];

const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
await put('matches/m1', { date, enabled: true, location: 'La Filial', maxPlayers: 10, playersList: friends.map(f => f.id) });

for (const friend of friends) {
  await put(`matches/m1/subscribers/${friend.id}`, {
    nickname: friend.nickname, image: AVATAR, played: friend.played, won: friend.won,
    friendOf: accounts[0] ?? '', lastGames: []
  });
  if (friend.profile) {
    await put(`users/${friend.id}`, {
      nickname: friend.nickname, roles: ['player'], ...friend.profile, image: AVATAR,
      googleLogin: false, friend: true, lastGames: ['P']
    });
  }
}

// Para la nueva temporada: jugó pero nunca ganó.
await put('users/s1', {
  nickname: 'Sinvictorias', roles: ['player'], played: 15, won: 0, image: AVATAR, googleLogin: false, friend: true, lastGames: []
});

console.log(`Listo: partido m1 (8/10 anotados) y ${accounts.length} cuenta(s) con rol de admin.`);
