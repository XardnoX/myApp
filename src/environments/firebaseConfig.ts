import { FirebaseApp, initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyDwsHxM4QPsux6P0AnXfhcKex3YbIfIikQ",
  authDomain: "pokladna-b4647.firebaseapp.com",
  databaseURL: "https://pokladna-b4647-default-rtdb.firebaseio.com",
  projectId: "pokladna-b4647",
  storageBucket: "pokladna-b4647.firebasestorage.app",
  messagingSenderId: "558550277315",
  appId: "1:558550277315:web:e679fe8e16b90aa8e1d676",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db: Firestore = getFirestore(app);

export { db };
