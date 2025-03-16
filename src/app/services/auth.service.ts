import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { getAuth, signInWithPopup, signInWithRedirect, OAuthProvider, UserCredential, getRedirectResult, User } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userId: string | null = null;

  constructor(private firestore: AngularFirestore, private router: Router) {}

  async loginWithMicrosoft() {
    try {
      const auth = getAuth();
      await auth.signOut();
      const provider = new OAuthProvider('microsoft.com');
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await this.handleLoginSuccess(result.user, true);
      }
    } catch (error) {
      alert('Při přihlašování nastala chyba. Zkuste to znovu.');
      this.router.navigate(['/home']);
    }
  }

  async loginWithMicrosoftAndroid() {
    try {
      const auth = getAuth();
      await auth.signOut();

      const currentUser = auth.currentUser;
      if (currentUser) {
        await this.handleLoginSuccess(currentUser, true);
        return;
      }

      const provider = new OAuthProvider('microsoft.com');
      provider.setCustomParameters({ prompt: 'select_account' });

      if (window.location.hostname === 'localhost' || window.location.protocol === 'http:') {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          await this.handleLoginSuccess(result.user, true);
        }
      } else {
        await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      alert('Při přihlašování nastala chyba. Zkuste to znovu.');
      this.router.navigate(['/home']);
    }
  }

  async checkRedirectResult(isInitialCheck = false) {
    const auth = getAuth();
    try {
      const result: UserCredential | null = await getRedirectResult(auth);

      if (result && (result as any).user) {
        const user = (result as any).user;
        await this.handleLoginSuccess(user, true); // Redirect after successful login
      } else if (!isInitialCheck) {
        if (result && (result as any)._tokenResponse) {
          if ((result as any)._tokenResponse.error) {
            alert('Při přihlašování nastala chyba. Zkuste to znovu.');
          }
        } else {
          const currentUser = auth.currentUser;
          if (currentUser) {
            await this.handleLoginSuccess(currentUser, false); // Skip redirect if already logged in
          } else {
            // Only navigate to /home if not on a protected route
            const currentPath = this.router.url;
            if (!currentPath || currentPath === '/home' || currentPath === '/login') {
              this.router.navigate(['/home']);
            } else {
              console.log('User not authenticated, but on protected route, skipping navigation:', currentPath);
            }
          }
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.checkRedirectResult(false);
      }
    } catch (error: any) {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        // Only show alert and navigate to /home if the user is not logged in
        alert('Při přihlašování nastala chyba. Zkuste to znovu.');
        const currentPath = this.router.url;
        if (!currentPath || currentPath === '/home' || currentPath === '/login') {
          this.router.navigate(['/home']);
        }
      } else {
        console.warn('Error during checkRedirectResult, but user is logged in, skipping navigation:', error);
      }
    }
  }

  private async handleLoginSuccess(user: any, redirect: boolean = false) {
    const email = user.email;

    if (email) {
      const userSnapshot = await this.firestore
        .collection('users', (ref) => ref.where('email', '==', email))
        .get()
        .toPromise();

      if (userSnapshot?.empty === false) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data() as { class?: string };
        const userClass = userData.class;

        this.userId = userDoc.id;
        localStorage.setItem('userId', this.userId);

        if (userClass) {
          localStorage.setItem('userClass', userClass);
          // Only redirect if explicitly requested (e.g., after login)
          if (redirect) {
            this.router.navigate([`/notifications/${userClass}`]);
          }
        } else {
          alert('U uživatele chybí třída(class), kontaktujte správce');
          if (redirect) {
            this.router.navigate(['/home']);
          }
        }
      } else {
        alert('Uživatel nebyl nalezen v databázi');
        if (redirect) {
          this.router.navigate(['/home']);
        }
      }
    } else {
      alert('Nebyl nalezen email, který by se shodoval s uživatelem.');
      if (redirect) {
        this.router.navigate(['/home']);
      }
    }
  }

  async logout() {
    const auth = getAuth();
    await auth.signOut();

    this.userId = null;
    localStorage.removeItem('userId');
    localStorage.removeItem('userClass');
    localStorage.removeItem('msalAccount');

    this.router.navigate(['/home']);
  }

  getUserId(): string | null {
    if (!this.userId) {
      this.userId = localStorage.getItem('userId');
    }
    return this.userId;
  }
}