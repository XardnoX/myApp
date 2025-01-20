import { Component, OnInit } from '@angular/core';
import { FirestoreService } from './services/firestore.service';
import { AuthService } from './services/auth.service'; // Import the AuthService
import { SplashScreen } from '@capacitor/splash-screen'; // Optional if you use Capacitor SplashScreen
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

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
  
  constructor(
    private firestoreService: FirestoreService, 
    private authService: AuthService,
    private router: Router
    
  ) {}

  ngOnInit() {
    
    App.addListener('appUrlOpen', (data: any) => {
      if (data.url) {
        console.log('App opened with URL:', data.url);
    
        // Handle the redirect URL from Firebase Auth
        if (data.url.includes('__/auth/handler')) {
          // Ensure the Angular router navigates properly
          this.router.navigateByUrl(data.url);
        }
      }
    });
    this.authService.checkRedirectResult();
    this.firestoreService.getUsers().subscribe((data) => {
      this.users = data;
      console.log('Users:', this.users);
    });
    
    
    // Optional: Hide splash screen if you're using Capacitor
    SplashScreen.hide();
  }
}
