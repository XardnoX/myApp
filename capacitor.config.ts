import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.com',
  appName: 'Pokladna',
  webDir: 'www',
  server: {
   // url: "https://localhost",
   // cleartext: false,
    allowNavigation: [
      'msauth://io.ionic.com',
      'login.microsoftonline.com',
      'login.microsoft.com',
      'https://*.firebaseapp.com'
    ]
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  }
};

export default config;
