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
  private isProcessingRedirect = false;

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
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isNativePlatform()) {
        // Any native-specific initialization
      }
    }).catch(error => console.error(error));
  }

  async handleRedirect() {
    if (this.isProcessingRedirect) return;
    this.isProcessingRedirect = true;

    try {
      const userId = this.authService.getUserId();
      console.log('AppComponent: userId=', userId);

      if (userId) {
        const userClass = localStorage.getItem('userClass');
        console.log('AppComponent: userClass=', userClass);
        if (userClass) {
          console.log('AppComponent: User is logged in, redirecting to /notifications/' + userClass);
          await this.router.navigateByUrl(`/notifications/${userClass}`);
        } else {
          console.error('AppComponent: userClass not found, redirecting to /home');
          await this.router.navigateByUrl('/home');
        }
      } else {
        console.log('AppComponent: User is not logged in, redirecting to /home');
        await this.router.navigateByUrl('/home');
      }
    } catch (error) {
      console.error('AppComponent: Error during redirect:', error);
      await this.router.navigateByUrl('/home');
    } finally {
      this.isProcessingRedirect = false;
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}