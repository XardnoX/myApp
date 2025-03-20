import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.com',
  appName: 'Pokladna',
  webDir: 'www',
  server: {
    androidScheme: 'capacitor',
    iosScheme: 'capacitor',
    allowNavigation: [
      'https://*.firebaseapp.com',
    ],
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    GenericOAuth2: { 
      androidScheme: 'capacitor',
      androidHost: 'oauth2',
      androidPath: '/callback'
    }
  }
};

export default config;