# Hay Equipo! ⚽

App para organizar los partidos de fútbol con amigos: anotarse, armar equipos parejos según las estadísticas y seguir el ranking. Es una PWA (se instala desde el navegador).

## Tecnologías 👨‍💻
- [Angular](https://angular.dev/) 21 (standalone, signals y sin zone.js)
- [Ionic](https://ionicframework.com/) 9
- [Firebase](https://firebase.google.com/) 12 con AngularFire 21 (Auth y Firestore)

## Desarrollo 🛠️

- Node 22+ (probado con Node 26) y `npm install`.
- `npm start` levanta la app en http://localhost:4200.
- `npm run build` genera la versión de producción en `www/` (con service worker / PWA).
- `npm test` corre los tests (Vitest) y `npm run lint` el linter.
- `npm run test:rules` corre los tests de las reglas de Firestore contra el emulador (necesita Java y `firebase-tools`).

### Probar con los emuladores

Para probar sin tocar la base real (proyecto `demo-hay-equipo`, solo en tu máquina):

1. `npm run emulators` levanta Auth y Firestore locales (necesita Java).
2. `npm run start:emulators` levanta la app en http://localhost:4300 contra los emuladores.
3. Entrá con una cuenta de prueba (el emulador muestra su propia pantalla de Google: "Add new account" → "Auto-generate user information").
4. `npm run emulators:seed` carga un partido de prueba y deja como admin a las cuentas que ya entraron.

Los datos del emulador se borran al cerrarlo.

### Probar el build de producción

`npm run build` y después `npx firebase emulators:start --only hosting --project demo-hay-equipo` sirven `www/` en http://localhost:5000 con el service worker activo (en el desarrollo normal no hay service worker). Ojo: el build de producción usa la base real `hay-equipo-v2`.

En Windows el emulador de Hosting no aplica los `headers` de `firebase.json` (un bug de la herramienta con las barras de las rutas); en Firebase Hosting sí se aplican.

## Sacar una versión nueva 🚀

1. `npm version minor --no-git-tag-version` (o `patch` / `major`): la versión sale solo de `package.json`.
2. Agregar sus novedades al principio de `src/app/changelog.ts`, contadas para los jugadores (`npm test` falla si faltan).
3. `npm run build` y `firebase deploy --only hosting` (y `firestore:rules` si cambiaron las reglas).

Los que tienen la app abierta reciben el aviso "Hay una versión nueva" (se busca al volver a la app y cada 30 minutos) y con "Actualizar" pasan a la nueva; si no, la nueva se abre sola la próxima vez. Después de actualizar, ven las novedades una sola vez.

### Firebase

El proyecto usa `hay-equipo-v2` (ver `.firebaserc` y `src/environments`). Las reglas de seguridad están en el repo:

```bash
firebase deploy --only firestore:rules
```

- Los roles (`admin`, `superadmin`) se asignan a mano en el campo `roles` del documento `users/{uid}`.
- El proyecto está en el plan gratuito (Spark): no usa Storage ni Cloud Functions. Los avatares son la foto de Google o el avatar por defecto.

## Marca 🎨

- **Isotipo:** dos "¡" que son dos jugadores, uno de cada equipo (blanco y negro). Fuentes en [`branding/`](branding/) y como componente en `src/app/components/logo-mark` (con animación para el loader).
- **Colores:** verde cancha `#14532d`, blanco `#ffffff`, negro `#0b0b0b` y crema `#f4efe3` para fondos claros.
- **Tipografía:** Bricolage Grotesque 800 para el nombre y títulos de marca; Exo 2 para el resto de la app.
- **Íconos:** `branding/app-icon.svg` es la fuente de los PNG de `src/assets/icons` (íconos de la PWA, con margen para la versión "maskable") y `src/assets/img/favicon.svg` la del favicon.

## Sobre la app 📱

La hice para usar con mis amigos en los partidos que jugamos los sábados. Permite anotarse al partido, seguir las estadísticas y armar los equipos según esas estadísticas para que el partido sea parejo.
Si la querés usar con tus amigos, escribime: te ayudo con gusto.

## Contacto 📧

Me podés escribir a <mpablo182@gmail.com>.
