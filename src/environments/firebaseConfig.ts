import { FirebaseApp, initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDwsHxM4QPsux6P0AnXfhcKex3YbIfIikQ",
  authDomain: "pokladna-b4647.firebaseapp.com",
  projectId: "pokladna-b4647",
  storageBucket: "pokladna-b4647.appspot.com",
  messagingSenderId: "558550277315",
  appId: "1:558550277315:web:e679fe8e16b90aa8e1d676"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db: Firestore = getFirestore(app);

export { db };
