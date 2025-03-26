import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ThemeService } from '../services/theme.service';
import { isPlatform } from '@ionic/angular';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  isDarkMode = false;
  private isNavigating = false;

  constructor(
    public authService: AuthService,
    private themeService: ThemeService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isNavigating = true;
      }
    });
  }

  async ngOnInit() {
    this.isDarkMode = this.themeService.isDark();
  }

  private async setupNotifications() {
    if (isPlatform('android') || isPlatform('ios')) {
      const permissionsGranted = await this.notificationService.requestNotificationPermissions();
      if (permissionsGranted) {
        const token = await this.notificationService.getFCMToken();
        if (token) {
          console.log('FCM token uložen', token);
        } 
  }
}}

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDark();
  }

  async login() {
    await this.authService.loginWithMicrosoft();
    const userId = this.authService.getUserId();
    if (userId) {
      await this.setupNotifications();
    } 
  }

  logout() {
    this.authService.logout();
  
  }
}