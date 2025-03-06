import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { getAuth, signInWithPopup, OAuthProvider, UserCredential, getRedirectResult } from 'firebase/auth';
import { PublicClientApplication, AccountInfo, RedirectRequest } from '@azure/msal-browser';
import { msalConfig } from 'src/msal.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userId: string | null = null;
  private msalInstance: PublicClientApplication;
  private account: AccountInfo | null = null;

  constructor(private firestore: AngularFirestore, private router: Router) {
    this.msalInstance = new PublicClientApplication(msalConfig);
    this.initializeMsal();
  }

  // Initialize MSAL and handle redirect if needed
  private async initializeMsal() {
    await this.msalInstance.initialize();
    if (!this.account) {
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
    const loginRequest: RedirectRequest = {
        scopes: ["User.Read"],
        prompt: "select_account"
    };

    const currentAccounts = this.msalInstance.getAllAccounts();
    if (currentAccounts.length > 0) {
        this.msalInstance.setActiveAccount(currentAccounts[0]);
        this.router.navigate(["/notifications"]);
        return;
    }

    await this.msalInstance.loginRedirect(loginRequest);
}

// Ensure handleRedirectPromise is called correctly
private async handleMsalRedirect() {
    try {
        const response = await this.msalInstance.handleRedirectPromise();
        
        if (response?.account) {
            this.account = response.account;
            localStorage.setItem("msalAccount", JSON.stringify(response.account));
            this.msalInstance.setActiveAccount(response.account);
            this.router.navigate(["/notifications"]);
        }
    } catch (error) {
        console.error("Error handling MSAL redirect:", error);
    }
}


async checkRedirectResult() {
  const auth = getAuth();
  try {
    const result: UserCredential | null = await getRedirectResult(auth);

    if (result && result.user) {
      console.log(' Login successful via Firebase redirect');
      await this.handleLoginSuccess(result.user);
    } else {
      console.warn('No user returned from Firebase redirect');
    }
  } catch (error) {
    console.error('❌ Error handling Firebase redirect result:', error);
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
        this.userId = userDoc.id;

        localStorage.setItem('userId', this.userId);
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
