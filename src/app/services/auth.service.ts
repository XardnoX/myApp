import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { getAuth, signInWithPopup, OAuthProvider } from 'firebase/auth';

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
    try {
      const auth = getAuth(); // Use modular SDK to initialize Auth
      const provider = new OAuthProvider('microsoft.com'); // Initialize Microsoft OAuthProvider

      // Perform sign-in with Microsoft provider
      const result = await signInWithPopup(auth, provider);

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

            // Store the user ID and class in localStorage for persistence
            localStorage.setItem('userId', this.userId);
            localStorage.setItem('userClass', userData.class);

            // Redirect the user to /notifications/(class)
            const userClass = userData.class;
            this.router.navigate([`/notifications/${userClass}`]);
          } else {
            console.error('User not found in Firestore.');
          }
        } else {
          console.error('No email found for the logged-in user.');
        }
      }
    } catch (error) {
      console.error('Error during Microsoft login:', error);
      if (error instanceof Error) {
        alert(`Authentication Error: ${error.message}`);
      }
    }
  }

  getUserClass(): Promise<string | null> {
    // Check if userClass is available in localStorage
    const userClass = localStorage.getItem('userClass');
    if (userClass) {
      return Promise.resolve(userClass);
    }

    // If not in localStorage, fetch it from Firestore
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
          localStorage.setItem('userClass', userData.class); // Cache in localStorage
          return userData.class;
        }
        return null;
      });
  }

  logout() {
    const auth = getAuth(); // Use modular SDK for sign-out
    auth.signOut().then(() => {
      this.userId = null;
      localStorage.removeItem('userId');
      localStorage.removeItem('userClass'); // Remove userClass from localStorage
      this.router.navigate(['/home']);
    });
  }

  getUserId(): string | null {
    if (!this.userId) {
      this.userId = localStorage.getItem('userId');
    }
    return this.userId;
  }
}
