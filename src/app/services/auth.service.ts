import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { getAuth, signInWithPopup, OAuthProvider, UserCredential, getRedirectResult } from 'firebase/auth';
import { PublicClientApplication, AccountInfo, RedirectRequest, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig } from 'src/msal.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userId: string | null = null;
  private msalInstance: PublicClientApplication;
  private account: AccountInfo | null = null;
  msalInitialized: any;

  constructor(private firestore: AngularFirestore, private router: Router) {
    this.msalInstance = new PublicClientApplication(msalConfig);
    this.initializeMsal();
  }

  private async ensureMsalInitialized(): Promise<void> {
    if (!this.msalInitialized) {
      try {
        await this.msalInstance.initialize();
        this.msalInitialized = true;
        console.log('MSAL initialized successfully');
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
        throw error;
      }
    }
  }

  public async initializeMsal(): Promise<void> {
    await this.ensureMsalInitialized();
    await this.handleMsalRedirect();
  }

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
      alert('An error occurred during login. Please try again.');
      this.router.navigate(['/home']); // Fallback route
    }
  }

  async loginWithMicrosoftAndroid() {
    const loginRequest: RedirectRequest = {
      scopes: ["User.Read"],
      prompt: "select_account"
    };

    const currentAccounts = this.msalInstance.getAllAccounts();
    if (currentAccounts.length > 0) {
      // Set the active account
      this.msalInstance.setActiveAccount(currentAccounts[0]);

      // Assuming user data has a class property
      const userDocSnapshot = await this.firestore
          .collection('users')
          .doc(currentAccounts[0].localAccountId)
          .get()
          .toPromise();

      // Ensure the document exists and has data
      if (userDocSnapshot && userDocSnapshot.exists) {
      // Define the user data with an explicit type that includes the "class" property
        const userData: { class?: string } = userDocSnapshot.data() || {}; // Explicit type for userData
        const userClass = userData.class;  // Now TypeScript knows userData has a 'class' property

      if (userClass) {
          this.router.navigate(['/notifications', userClass]);
      } else {
        console.error('No userClass found for user:', currentAccounts[0].localAccountId);
          this.router.navigate(['/notifications']); // Fallback route
      }
      } else {
          console.warn('User document not found for ID:', currentAccounts[0].localAccountId);
          this.router.navigate(['/notifications']); // Fallback route
      }
    }

    // For new logins, trigger the redirect
    await this.msalInstance.loginRedirect(loginRequest);
  }

  public async handleMsalRedirect(redirectUrl?: string): Promise<void> {
    try {
      await this.ensureMsalInitialized();
      const response: AuthenticationResult | null = redirectUrl
        ? await this.msalInstance.handleRedirectPromise(redirectUrl)
        : await this.msalInstance.handleRedirectPromise();
      console.log('handleRedirectPromise response:', response);

      if (response?.account) {
        this.msalInstance.setActiveAccount(response.account);
        const userDocSnapshot = await this.firestore
          .collection('users')
          .doc(response.account.localAccountId)
          .get()
          .toPromise() as DocumentSnapshot<{ class?: string }>;

        // Ensure we check for null or undefined before accessing data
        if (userDocSnapshot && userDocSnapshot.exists) {
          const userData = userDocSnapshot.data() || {};
          if (userData.class) {
            this.userId = userDocSnapshot.id;
            localStorage.setItem('userId', this.userId);
            localStorage.setItem('userClass', userData.class);
            this.router.navigate(['notifications', userData.class]).then(() => {
              console.log('Navigation to notifications successful');
            }).catch(err => console.error('Navigation error:', err));
          } else {
            console.error('User data missing "class" field:', userData);
            alert('User data incomplete. Please contact support.');
            this.router.navigate(['/notifications']); // Fallback route
          }
        } else {
          console.warn('User not found in Firestore for ID:', response.account.localAccountId);
          alert('User not found in Firestore.');
          this.router.navigate(['/home']); // Fallback route
        }
      } else if (response === null) {
        console.log('No active authentication session detected');
      }
    } catch (error) {
      console.error('Error during MSAL redirect:', error);
      alert('An error occurred during login. Please try again.');
      this.router.navigate(['/home']); // Navigate to home or error page
    }
  }

  async checkRedirectResult() {
    const auth = getAuth();
    try {
      const result: UserCredential | null = await getRedirectResult(auth);

      if (result && result.user) {
        console.log('Login successful via Firebase redirect');
        await this.handleLoginSuccess(result.user);
      } else {
        console.warn('No user returned from Firebase redirect');
      }
    } catch (error) {
      console.error('❌ Error handling Firebase redirect result:', error);
      alert('An error occurred during login. Please try again.');
      this.router.navigate(['/home']); // Navigate to home or error page
    }
  }

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
        this.userId = userDoc.id;

        localStorage.setItem('userId', this.userId);
        localStorage.setItem('userClass', userData.class);

        this.router.navigate([`/notifications/${userData.class}`]);
      } else {
        alert('User not found in Firestore.');
        this.router.navigate(['/notifications']); // Fallback route
      }
    } else {
      alert('No email found for the logged-in user.');
      this.router.navigate(['/notifications']); // Fallback route
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
