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
      if (data.url.startsWith('msauth://io.ionic.com')) {
          console.log('Handling MSAL redirect...');
          this.authService.handleMsalRedirect(); 
      }
  });
  

    this.firestoreService.getUsers().subscribe((data) => {
      this.users = data;
    });

    SplashScreen.hide();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}
