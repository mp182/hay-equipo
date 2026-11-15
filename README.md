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
- Las fotos de perfil necesitan Firebase Storage (plan Blaze); las reglas están en `storage.rules`.

## Contact 📧

If you want to contact me you can reach me at <mpablo182@gmail.com>.

## About the app 📱

I created this app to use with my friends for the soccer matches we play on Saturdays. It lets you subscribe to the match, follow statistics, and build the teams based on the statistics to make the match fair.
If you want to use it with your friends please contact me! I'll very glad of helping you.
