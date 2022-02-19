import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'YOUR_APP_ID_HERE',
  appName: 'HayEquipo',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#CE0B7C',
    },
    PushNotifications: {
      presentationOptions: ['alert', 'sound'],
    },
  },
};

export default config;
