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
  private isFileInputActive = false; 

  constructor(
    private platform: Platform,
    private authService: AuthService
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    if (!Capacitor.isNativePlatform()) {
      window.addEventListener('focus', async () => {

        if (!this.isProcessingRedirect && !this.isFileInputActive) {
          this.isProcessingRedirect = true;

          await this.authService.checkRedirectResult(false).catch(error => {
            console.error(error);
          });

          this.isProcessingRedirect = false;
        }
      });
    }

    document.addEventListener('focus', (event) => {

      if (event.target instanceof HTMLInputElement && event.target.type === 'file') {
        this.isFileInputActive = true;
      }
    }, true);

    document.addEventListener('blur', (event) => {

      if (event.target instanceof HTMLInputElement && event.target.type === 'file') {
        this.isFileInputActive = false;
      }
    }, true);
  }
  initializeApp() {

    this.platform.ready().then(() => {

      if (Capacitor.isNativePlatform()) {
        App.addListener('appStateChange', async (state) => {

          if (state.isActive && !this.isProcessingRedirect) {
            this.isProcessingRedirect = true;

            await new Promise(resolve => setTimeout(resolve, 500));

            await this.authService.checkRedirectResult(true).catch(error => {
              console.error(error);
            });
            this.isProcessingRedirect = false;
          }
        }).catch(error => console.error(error));

        App.addListener('appUrlOpen', async (data) => {
          console.log('App URL opened:', data.url);

          if (data.url.includes('firebaseapp.com/__/auth/handler') && !this.isProcessingRedirect) {
            this.isProcessingRedirect = true;

            await new Promise(resolve => setTimeout(resolve, 500));

            await this.authService.checkRedirectResult(true).catch(error => {
              console.error(error);
            });
            this.isProcessingRedirect = false;
           } 
          else if (data.url.includes('msauth://')) {
            console.warn('Chyba, neočekávaný MSAL redirect:', data.url);
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