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
    // No need for appUrlOpen listener with generic-oauth2
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isNativePlatform()) {
        // Any native-specific initialization
      }
    }).catch(error => console.error(error));
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}