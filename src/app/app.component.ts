import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

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
    private authService: AuthService
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      App.addListener('appUrlOpen', async (data) => {
        if (data.url.includes('msauth://') && !this.isProcessingRedirect) {
          this.isProcessingRedirect = true;
          await this.authService.handleRedirectResult();
          this.isProcessingRedirect = false;
        }
      }).catch(error => console.error(error));
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isNativePlatform()) {
        App.addListener('appStateChange', async (state) => {
          if (state.isActive && !this.isProcessingRedirect) {
            this.isProcessingRedirect = true;
            await this.authService.handleRedirectResult();
            this.isProcessingRedirect = false;
          }
        }).catch(error => console.error(error));
      }
    }).catch(error => console.error(error));
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}
