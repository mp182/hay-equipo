// Para probar contra los emuladores locales de Firebase (`npm run emulators` + `npm run start:emulators`).
// El proyecto `demo-*` es especial: el SDK nunca habla con servidores reales de Google.
export const environment = {
  production: false,
  firebase: {
    apiKey: 'demo-api-key',
    authDomain: 'demo-hay-equipo.firebaseapp.com',
    projectId: 'demo-hay-equipo',
    appId: 'demo-app'
  },
  useEmulators: true
};
