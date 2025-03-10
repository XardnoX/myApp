import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { getAuth, signInWithPopup, OAuthProvider, UserCredential, getRedirectResult } from 'firebase/auth';
import { PublicClientApplication, AccountInfo, RedirectRequest, BrowserAuthError } from '@azure/msal-browser';
import { msalConfig } from 'src/msal.config';
import { MsAuthPlugin } from '@recognizebv/capacitor-plugin-msauth';

interface MsAuthResult {
    accessToken: string;
    account?: {
        username?: string;
    };
}

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private userId: string | null = null;
  private msalInstance: PublicClientApplication;
  private account: AccountInfo | null = null;
  private msalInitialized = false; // Add the missing initialization flag

  constructor(private firestore: AngularFirestore, private router: Router) {
    this.msalInstance = new PublicClientApplication(msalConfig);
    this.initializeMsal();
  }

  // Initialize MSAL and handle redirect if needed
  private async initializeMsal() {
    if (!this.msalInitialized) {
      await this.msalInstance.initialize(); // Ensure MSAL is initialized
      this.msalInitialized = true;
      console.log('MSAL initialized successfully');
      await this.handleMsalRedirect();
    }
  }


  // Login with Microsoft via Firebase OAuth
  async loginWithMicrosoft() {
    try {
      const auth = getAuth();
      await auth.signOut();
      const provider = new OAuthProvider('microsoft.com');
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await this.handleLoginSuccess(result.user);
      }
    } catch (error) {
      console.error('Error during Microsoft login (Popup):', error);
    }
  }
  async loginWithMicrosoftAndroid() {
    try {
        console.log('Starting Microsoft authentication using MsAuthPlugin...');
        const result = await MsAuthPlugin.login({
          clientId: '8117fe5b-a44f-42a2-89c3-f40bc9076356',
          scopes: ['user.read']
        }) as MsAuthResult;
        const accessToken = result.accessToken;
        console.log('Access Token obtained:', accessToken);

        const email = result.account?.username;

        if (email) {
          this.handleLoginSuccess(email);
      } else {
          alert('No email found for the logged-in user.');
      }
  } catch (error) {
      console.error('Error during Microsoft login (MsAuthPlugin):', error);
  }
}




// Ensure handleRedirectPromise is called correctly
async handleMsalRedirect() {
  try {
      const response = await this.msalInstance.handleRedirectPromise();

      if (response?.account) {
          this.account = response.account;
          localStorage.setItem('msalAccount', JSON.stringify(response.account));
          this.msalInstance.setActiveAccount(response.account);
          this.router.navigate(['/notifications']);
      } else {
          console.warn('No account found in MSAL redirect response');
      }
  } catch (error) {
      console.error('Error handling MSAL redirect:', error);
  }
}




async checkRedirectResult() {
  try {
    const auth = getAuth();
    const result = await getRedirectResult(auth);

    if (result?.user) {
      console.log('Login successful via Firebase redirect');
      await this.handleLoginSuccess(result.user);
    } else {
      console.warn('No user returned from Firebase redirect');
    }
  } catch (error) {
    console.error('Error handling Firebase redirect result:', error);
  }
}

  // Handle successful login
  private async handleLoginSuccess(user: any) {
    const email = user.email;

    if (email) {
      const userSnapshot = await this.firestore
        .collection('users', (ref) => ref.where('email', '==', email))
        .get()
        .toPromise();

      if (userSnapshot?.empty === false) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data() as { class: string };

        localStorage.setItem('userId', userDoc.id);
        localStorage.setItem('userClass', userData.class);

        this.router.navigate([`/notifications/${userData.class}`]);
      } else {
        alert('User not found in Firestore.');
      }
    } else {
      alert('No email found for the logged-in user.');
    }
  }

  // Logout from Firebase but keep Microsoft session
  async logout() {
    const auth = getAuth();
    await auth.signOut(); 

    this.userId = null;
    localStorage.removeItem('userId');
    localStorage.removeItem('userClass');
    localStorage.removeItem('msalAccount');

    this.router.navigate(['/home']);
  }

  // Retrieve the user ID from local storage if not already set
  getUserId(): string | null {
    if (!this.userId) {
      this.userId = localStorage.getItem('userId');
    }
    return this.userId;
  }
}
