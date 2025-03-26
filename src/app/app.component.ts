import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { ThemeService } from './services/theme.service';
import { NotificationService } from './services/notification.service';
import { isPlatform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  isDarkMode = false;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private themeService: ThemeService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.handleRedirect();
    
 //   this.notificationService.requestNotificationPermissions();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isNativePlatform()) {
      }
    }).catch(error => console.error(error));
  }

  async handleRedirect() {
    try {
      const userId = this.authService.getUserId();
      if (userId) {
        const userClass = localStorage.getItem('userClass');
        if (userClass) {
          await this.router.navigateByUrl(`/notifications/${userClass}`);
        } else {
          await this.router.navigateByUrl('/home');
        }
      } else {
        await this.router.navigateByUrl('/home');
      }
    } catch (error) {
      console.error('Chyba při přesměrování:', error);
      await this.router.navigateByUrl('/home');
    } 
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}