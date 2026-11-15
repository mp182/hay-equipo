# Hay Equipo! ⚽

This project was generated with [Ionic CLI](https://ionicframework.com/docs/cli).

## Technology Stack 👨‍💻
- [Ionic](https://ionicframework.com/)
- [Angular](https://angular.io/)
- [Firebase](https://firebase.google.com/)

## Desarrollo 🛠️

- Node 22+ (probado con Node 26) y `npm install`.
- `npm start` levanta la app en http://localhost:4200.
- `npm run build` genera la versión de producción en `www/` (con service worker / PWA).
- `npm test` corre los tests (Vitest) y `npm run lint` el linter.

Stack: Angular 21 (standalone + signals), Ionic 9, AngularFire 21 / Firebase 12, Capacitor 8.

### Firebase

El proyecto usa `hay-equipo-v2` (ver `.firebaserc` y `src/environments`). Las reglas de seguridad están en el repo:

```bash
firebase deploy --only firestore:rules
```

- Los roles (`admin`, `superadmin`) se asignan a mano en el campo `roles` del documento `users/{uid}`.
- Para el aviso de "nueva versión", cargar un documento en la colección `version` con el campo `version` (y las novedades en `news`).
- El proyecto está en el plan gratuito (Spark): no usa Storage ni Cloud Functions. Los avatares son la foto de Google o el avatar por defecto.

## Marca 🎨

- **Isotipo:** dos "¡" que son dos jugadores, uno de cada equipo (blanco y negro). Fuentes en [`branding/`](branding/) y como componente en `src/app/components/logo-mark` (con animación para el loader).
- **Colores:** verde cancha `#14532d`, blanco `#ffffff`, negro `#0b0b0b` y crema `#f4efe3` para fondos claros.
- **Tipografía:** Bricolage Grotesque 800 para el nombre y títulos de marca; Exo 2 para el resto de la app.
- **Íconos:** `branding/app-icon.svg` es la fuente de los PNG de `src/assets/icons` (íconos de la PWA, con margen para la versión "maskable") y `src/assets/img/favicon.svg` la del favicon.

## Contact 📧

If you want to contact me you can reach me at <mpablo182@gmail.com>.

## About the app 📱

I created this app to use with my friends for the soccer matches we play on Saturdays. It lets you subscribe to the match, follow statistics, and build the teams based on the statistics to make the match fair.
If you want to use it with your friends please contact me! I'll very glad of helping you.
