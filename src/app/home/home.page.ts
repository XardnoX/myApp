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
    // Listen for navigation events to prevent double navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isNavigating = true;
      }
    });
  }

  ngOnInit() {
    this.isDarkMode = this.themeService.isDark();

    const userId = this.authService.getUserId();
    if (userId && !this.isNavigating) {
      const userClass = localStorage.getItem('userClass');
      if (userClass) {
        console.log('HomePage: Navigating to /notifications/', userClass);
        this.router.navigateByUrl(`/notifications/${userClass}`).then(success => {
          console.log('HomePage navigation success:', success);
        }).catch(error => {
          console.error('HomePage navigation error:', error);
        });
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