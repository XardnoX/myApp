import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { initializeApp } from 'firebase/app';

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

// Initialize Firebase
initializeApp(firebaseConfig);

// Load the Google API script dynamically
const script = document.createElement('script');
script.src = 'https://apis.google.com/js/api.js';
script.async = true;
script.defer = true;
script.onload = () => {
  console.log('Google API client library loaded successfully');
  gapi.load('client:auth2', () => {
    console.log('gapi.client and gapi.auth2 initialized');
  });
};
document.body.appendChild(script);
