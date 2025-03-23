import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  async addFCMTokenToUser(userId: string, token: string): Promise<void> {
    if (!userId || !token) {
      throw new Error('ID uživatele a token jsou povinné pro přidání FCM tokenu.');
    }

    const userRef = doc(this.firestore, 'users', userId);

    try {
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, { fcmTokens: [token] });
      } else {
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(token),
        });
      }
    } catch (error) {
      console.error('Chyba při přidávání FCM tokenu do Firestore:', error);
      throw error;
    }
  }

  async removeFCMTokenFromUser(userId: string, token: string): Promise<void> {
    if (!userId || !token) {
      throw new Error('ID uživatele a token jsou povinné pro odstranění FCM tokenu.');
    }

    const userRef = doc(this.firestore, 'users', userId);

    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          fcmTokens: arrayRemove(token),
        });
      } 
    } catch (error) {
      console.error('Chyba při odstraňování FCM tokenu z Firestore:', error);
      throw error;
    }
  }

  async getFCMTokensForUser(userId: string): Promise<string[] | null> {
    if (!userId) {
      throw new Error('ID uživatele je povinné pro získání FCM tokenů.');
    }

    const userRef = doc(this.firestore, 'users', userId);

    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data['fcmTokens'] || [];
      } else {
        return null;
      }
    } catch (error) {
      console.error('Chyba při získávání FCM tokenů z Firestore:', error);
      throw error;
    }
  }
}