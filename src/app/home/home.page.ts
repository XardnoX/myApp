import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ThemeService } from '../services/theme.service';
import { isPlatform } from '@ionic/angular';

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

    if (isPlatform('android') || isPlatform('ios')) {
      this.notificationService.requestNotificationPermissions();
      this.notificationService.listenForMessages();
    } else {
      console.log('Push notifications are not supported on this platform.');
    }
  
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDark();
  }

  login() {
    if (isPlatform('android')) {
      this.authService.loginWithMicrosoftAndroid();
    } else {
      this.authService.loginWithMicrosoft();
    }
  }

  logout() {
    this.authService.logout();
  }
}
