import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { OAuth2AuthenticateOptions, GenericOAuth2 } from '@capacitor-community/generic-oauth2';
import { firebaseConfig } from '../../environments/firebaseConfig';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userId: string | null = null;

  constructor(private firestore: AngularFirestore, private router: Router) {
    this.firestore.firestore.enablePersistence().catch(err => {
      console.error('Chyba při povolování perzistence Firestore:', err);
    });
  }

  private getAzureOAuth2Options(): OAuth2AuthenticateOptions {
    return {
      appId: '8117fe5b-a44f-42a2-89c3-f40bc9076356',
      authorizationBaseUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      accessTokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scope: 'User.Read email profile openid',
      responseType: 'code',
      pkceEnabled: true,
      logsEnabled: true,
      android: {
        redirectUrl: 'capacitor://oauth2/callback',
      },
      web: {
        redirectUrl: window.location.origin,
        windowOptions: 'height=600,left=0,top=0',
      },
    };
  }

  async loginWithMicrosoft() {
    try {
      const options = this.getAzureOAuth2Options();
      const result = await GenericOAuth2.authenticate(options);
      const accessToken = result.access_token_response?.access_token || result.access_token;
      if (!accessToken) {
        throw new Error('Není k dispozici žádný přístupový token od poskytovatele OAuth2');
      }

      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chyba Graph API: ${response.status} - ${response.statusText} - ${errorText}`);
      }

      const user = await response.json();
      const email = user.mail || user.userPrincipalName;
      if (!email) {
        throw new Error('U uživatele nebyl nalezen žádný e-mail');
      }

      const userSnapshot = await this.firestore
        .collection('users', (ref) => ref.where('email', '==', email))
        .get()
        .toPromise();

      if (!userSnapshot || userSnapshot.empty) {
        throw new Error('Uživatel nebyl nalezen v databázi');
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data() as { class?: string };
      const userClass = userData.class;

      this.userId = userDoc.id;
      localStorage.setItem('userId', this.userId);

      if (userClass) {
        localStorage.setItem('userClass', userClass);
        console.log('Přesměrování na:', `/notifications/${userClass}`);
        // Přidání krátkého zpoždění, aby byl WebView připraven
        await new Promise(resolve => setTimeout(resolve, 100));
        try {
          await this.router.navigateByUrl(`/notifications/${userClass}`);
          console.log('Přesměrování úspěšně dokončeno');
        } catch (error) {
          console.error('Chyba při přesměrování:', error);
          throw new Error('Nepodařilo se přesměrovat na stránku oznámení');
        }
      } else {
        throw new Error('U uživatele chybí informace o třídě, kontaktujte prosím administrátora');
      }
    } catch (error: any) {
      console.error('Podrobnosti chyby při přihlášení:', error);
      alert(`Při přihlášení došlo k chybě: ${error.message || error}. Zkuste to prosím znovu.`);
      await this.router.navigateByUrl('/home');
    }
  }

  async logout() {
    try {
      this.userId = null;
      localStorage.removeItem('userId');
      localStorage.removeItem('userClass');
      localStorage.removeItem('msalAccount');
      await this.router.navigateByUrl('/home');
      console.log('Odhlášení úspěšně dokončeno');
    } catch (error) {
      console.error('Chyba při odhlášení:', error);
    }
  }

  getUserId(): string | null {
    if (!this.userId) {
      this.userId = localStorage.getItem('userId');
    }
    return this.userId;
  }
}