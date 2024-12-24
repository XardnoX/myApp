import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userId: string | null = null; // Stores the Firestore document ID of the logged-in user

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  async loginWithMicrosoft() {
    const provider = new firebase.auth.OAuthProvider('microsoft.com');

    try {
      // Sign in with Microsoft provider
      const result = await this.afAuth.signInWithPopup(provider);

      if (result.user) {
        const email = result.user.email;

        if (email) {
          // Check if the user exists in Firestore by email
          const userSnapshot = await this.firestore
            .collection('users', (ref) => ref.where('email', '==', email))
            .get()
            .toPromise();

          if (userSnapshot && !userSnapshot.empty) {
            // Extract user ID and class from the matching document
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data() as { class: string };
            this.userId = userDoc.id;

            // Store the user ID in localStorage for persistence
            localStorage.setItem('userId', this.userId);

            // Redirect the user to /notifications/(class)
            const userClass = userData.class;
            this.router.navigate([`/notifications/${userClass}`]);
          } else {
            console.error('User not found in Firestore.');
            // Handle case where the user does not exist in Firestore
          }
        } else {
          console.error('No email found for the logged-in user.');
        }
      }
    } catch (error) {
      console.error('Error during Microsoft login:', error);
    }
  }
  getUserClass(): Promise<string | null> {
    const userId = this.getUserId();
    if (!userId) {
      return Promise.resolve(null);
    }
  
    return this.firestore
      .collection('users')
      .doc(userId)
      .get()
      .toPromise()
      .then((doc) => {
        if (doc && doc.exists) {
          const userData = doc.data() as { class: string };
          return userData.class;
        }
        return null;
      });
  }
  logout() {
    this.afAuth.signOut();
    this.userId = null;
    localStorage.removeItem('userId');
    this.router.navigate(['/home']);
  }

  getUserId(): string | null {
    if (!this.userId) {
      this.userId = localStorage.getItem('userId');
    }
    return this.userId;
  }
}
