import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ThemeService } from '../services/theme.service';
import { isPlatform } from '@ionic/angular';
import { Router } from '@angular/router';

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
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isDarkMode = this.themeService.isDark();

    const userId = this.authService.getUserId();
    if (userId) {
      const userClass = localStorage.getItem('userClass');
      if (userClass) {
        this.router.navigate([`/notifications/${userClass}`]);
      } else {
        this.logout();
        console.log('Role uživatele nebyla nalezena v localStorage');
      }
    }

    if (isPlatform('android') || isPlatform('ios')) {
      this.notificationService.requestNotificationPermissions();
      this.notificationService.listenForMessages();
    }
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