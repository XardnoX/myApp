import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ThemeService } from '../services/theme.service';
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
  isDarkMode = false;

  constructor(
    public authService: AuthService,
    private themeService: ThemeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.isDarkMode = this.themeService.isDark();

    // Call the notification methods
    this.notificationService.requestNotificationPermissions(); // Ensure parentheses are added
    this.notificationService.listenForMessages(); // Ensure parentheses are added
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDark();
  }

  login() {
    this.authService.loginWithMicrosoft();
  }

  logout() {
    this.authService.logout();
  }
}
