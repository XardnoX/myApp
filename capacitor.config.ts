import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.com',
  appName: 'Pokladna',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'https://*.firebaseapp.com'
    ]
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  }
};

export default config;