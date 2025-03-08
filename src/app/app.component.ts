import { Component, OnInit } from '@angular/core';
import { FirestoreService } from './services/firestore.service';
import { AuthService } from './services/auth.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { MsalService } from '@azure/msal-angular';
import { CustomNavigationClient } from 'src/app/services/customNavigationClient';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  users: any[] = [];
  isDarkMode = false;

  constructor(
    private firestoreService: FirestoreService, 
    private authService: AuthService,
    private router: Router,
    private msalService: MsalService,
    private inAppBrowser: InAppBrowser // ✅ Properly inject InAppBrowser
  ) {}

  ngOnInit() {
    // Set up the custom navigation client for MSAL
    const navigationClient = new CustomNavigationClient(this.inAppBrowser);
    this.msalService.instance.setNavigationClient(navigationClient);

    // Handle MSAL redirect promises
    this.msalService.instance.handleRedirectPromise().then((authResult: any) => {
      console.debug('AuthResult ---->', authResult);
      if (authResult) { 
        console.log('MSAL Authentication successful');
      } else {
        console.warn('No authentication result, initiating login redirect');
        this.msalService.instance.loginRedirect();
      }
    });

    // Listen for app URL opens (important for handling MSAL redirects)
    App.addListener('appUrlOpen', (data: any) => {
        if (data.url) {
            console.log('App opened with URL:', data.url);

            // Check if the URL is related to Firebase Auth
            if (data.url.includes('__/auth/handler')) {
                console.log('Handling Firebase Auth redirect...');
                this.router.navigateByUrl(data.url);
                this.authService.checkRedirectResult();
                return;
            }

            // Check if the URL is related to MSAL authentication
            else if (data.url.startsWith('msauth://io.ionic.com')) {
                console.log('Handling MSAL redirect...');
                this.authService.handleMsalRedirect();
                return;
            }

            console.warn('Unhandled app URL:', data.url);
        }
    });

    // Load users from Firestore
    this.firestoreService.getUsers().subscribe((data) => {
      this.users = data;
    });

    // Hide splash screen once initialization is complete
    SplashScreen.hide();
  }

  // Toggle between light and dark themes
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}
