import { Component, OnInit } from '@angular/core';
import { FirestoreService } from './services/firestore.service';
import { AuthService } from './services/auth.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';

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
    private router: Router
  ) {}

  ngOnInit() {
    // Listen for app URL opens (important for handling MSAL redirects)
    App.addListener('appUrlOpen', (data: any) => {
      if (data.url) {
        console.log('App opened with URL:', data.url);
        
        // Check if the URL is related to Firebase Auth
        if (data.url.includes('__/auth/handler')) {
          this.router.navigateByUrl(data.url);
        }

        // Check if the URL is related to MSAL authentication
        if (data.url.startsWith('msauth://io.ionic.com')) {
          this.authService.checkRedirectResult();
        }
      }
    });

    // Directly check for MSAL redirect results when app initializes
    this.authService.checkRedirectResult();

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
