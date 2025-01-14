import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit() {
    // Handle login redirect results on initialization
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      }
    });
    
  }

  login() {
    this.authService.loginWithMicrosoft();
  }

  logout() {
    this.authService.logout();
  }
}
