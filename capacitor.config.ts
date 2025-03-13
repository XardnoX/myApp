import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.com',
  appName: 'Pokladna',
  webDir: 'www',
  server: {
    allowNavigation: [
      'msauth://io.ionic.com',
      'login.microsoftonline.com',
      'login.microsoft.com',
      'https://*.firebaseapp.com'
    ]
  },
  plugins: {
    MsAuthPlugin: {
      clientId: '8117fe5b-a44f-42a2-89c3-f40bc9076356',
      tenantId: 'f9e9eee3-6c9a-4068-a89c-6d96a10f21b9', // Replace with your tenant ID or 'common' for multi-tenant
      scopes: ['user.read'],
      redirectUri: 'msauth://io.ionic.com/5mCAxrHN2386pwqP%2FGQEY2lIvnw%3D'
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  }
};

export default config;
