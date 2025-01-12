import { Component, OnInit } from '@angular/core';
import { FirestoreService } from './services/firestore.service';
import { AuthService } from './services/auth.service'; // Import the AuthService
import { SplashScreen } from '@capacitor/splash-screen'; // Optional if you use Capacitor SplashScreen

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  users: any[] = [];

  constructor(
    private firestoreService: FirestoreService, 
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.checkRedirectResult();
    this.firestoreService.getUsers().subscribe((data) => {
      this.users = data;
      console.log('Users:', this.users);
    });
    

    // Optional: Hide splash screen if you're using Capacitor
    SplashScreen.hide();
  }
}
