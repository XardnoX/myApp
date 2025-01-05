import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, OAuthProvider } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userId: string | null = null;

  constructor(private firestore: AngularFirestore, private router: Router) {}

  async loginWithMicrosoft() {
    try {
      const auth = getAuth();
      await auth.signOut(); // Clear any existing session
      const provider = new OAuthProvider('microsoft.com');
      provider.setCustomParameters({
        prompt: 'select_account', // Prompt account selection
      });
  
      const result = await signInWithPopup(auth, provider);
  
      if (result.user) {
        console.log('Logged-in User:', result.user);
        await this.handleLoginSuccess(result.user);
      }
    } catch (error) {
      console.error('Error during Microsoft login:', error);
    }
  }
  
  
  async checkRedirectResult() {
    const auth = getAuth();
    try {
      const result = await getRedirectResult(auth);

      if (result && result.user) {
        console.log('Login successful via redirect');
        await this.handleLoginSuccess(result.user);
      }
    } catch (error) {
      console.error('Error handling redirect result:', error);
    }
  }

  private async handleLoginSuccess(user: any) {
    const email = user.email;

    if (email) {
      const userSnapshot = await this.firestore
        .collection('users', (ref) => ref.where('email', '==', email))
        .get()
        .toPromise();

      if (userSnapshot && !userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data() as { class: string };
        this.userId = userDoc.id;

        localStorage.setItem('userId', this.userId);
        localStorage.setItem('userClass', userData.class);

        const userClass = userData.class;
        this.router.navigate([`/notifications/${userClass}`]);
      } else {
        console.error('User not found in Firestore.');
        alert('User not found in Firestore.');
      }
    } else {
      console.error('No email found for the logged-in user.');
      alert('No email found for the logged-in user.');
    }
  }

  logout() {
    const auth = getAuth();
    auth.signOut().then(() => {
      this.userId = null;
      localStorage.removeItem('userId');
      localStorage.removeItem('userClass');
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
