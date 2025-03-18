import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { PublicClientApplication, InteractionRequiredAuthError, AccountInfo } from '@azure/msal-browser';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userId: string | null = null;
  private msalInstance: PublicClientApplication;
  private isInitialized = false;

  constructor(private firestore: AngularFirestore, private router: Router) {
    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: '8117fe5b-a44f-42a2-89c3-f40bc9076356',
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: Capacitor.isNativePlatform()
          ? 'msauth://io.ionic.com/5mCAxrHN2386pwqP/GQEY2lIvnw='
          : window.location.origin,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    });

    this.initializeMSAL();
  }

  private async initializeMSAL() {
    try {
      await this.msalInstance.initialize();
      this.isInitialized = true;
      await this.msalInstance.handleRedirectPromise();
    } catch (error) {
      console.error('MSAL initialization error:', error);
    }
  }

  async handleRedirectResult() {
    if (!this.isInitialized) {
      console.error('MSAL is not initialized yet');
      return;
    }
    try {
      const result = await this.msalInstance.handleRedirectPromise();
      if (result && result.account) {
        await this.handleLoginSuccess(result.account);
      } else {
        const accounts = this.msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          await this.handleLoginSuccess(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Redirect handling error:', error);
    }
  }

  async loginWithMicrosoft() {
    if (!this.isInitialized) {
      console.error('MSAL is not initialized yet');
      return;
    }

    try {
      const loginRequest = {
        scopes: ['User.Read'],
        prompt: 'select_account',
      };

      if (Capacitor.isNativePlatform()) {
        await this.msalInstance.loginRedirect(loginRequest);
      } else {
        const result = await this.msalInstance.loginPopup(loginRequest);
        if (result.account) {
          await this.handleLoginSuccess(result.account);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Při přihlašování nastala chyba. Zkuste to znovu.');
      this.router.navigate(['/home']);
    }
  }

  private async handleLoginSuccess(account: AccountInfo) {
    const email = account.username;

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
          this.router.navigate([`/notifications/${userClass}`]);
        } else {
          alert('U uživatele chybí třída(class), kontaktujte správce');
          this.router.navigate(['/home']);
        }
      } else {
        alert('Uživatel nebyl nalezen v databázi');
        this.router.navigate(['/home']);
      }
    } else {
      alert('Nebyl nalezen email, který by se shodoval s uživatelem.');
      this.router.navigate(['/home']);
    }
  }

  async logout() {
    try {
      this.userId = null;
      localStorage.removeItem('userId');
      localStorage.removeItem('userClass');
      localStorage.removeItem('msalAccount');
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getUserId(): string | null {
    if (!this.userId) {
      this.userId = localStorage.getItem('userId');
    }
    return this.userId;
  }
}
