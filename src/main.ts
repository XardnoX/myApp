import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { initializeApp, getApps } from 'firebase/app'; // Import getApps to check existing instances


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

export const firebaseConfig = {
  apiKey: "AIzaSyDwsHxM4QPsux6P0AnXfhcKex3YbIfIikQ",
  authDomain: "pokladna-b4647.firebaseapp.com",
  projectId: "pokladna-b4647",
  storageBucket: "pokladna-b4647.appspot.com",
  messagingSenderId: "558550277315",
  appId: "1:558550277315:web:e679fe8e16b90aa8e1d676"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
} else {
  console.log('Firebase App already initialized');
}


