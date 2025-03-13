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
    console.log('App initialized');
    // Check redirect result on web resume
    if (!Capacitor.isNativePlatform()) {
      window.addEventListener('focus', async () => {
        if (!this.isProcessingRedirect) {
          this.isProcessingRedirect = true;
          console.log('Window focused (web), checking redirect result...');
          await this.authService.checkRedirectResult(true).catch(error => {
            console.error('Error handling redirect result on web resume:', error);
          });
          this.isProcessingRedirect = false;
        }
      });
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      console.log('Platform ready, setting up listeners...');
      if (Capacitor.isNativePlatform()) {
        App.addListener('appStateChange', async (state) => {
          if (state.isActive && !this.isProcessingRedirect) {
            this.isProcessingRedirect = true;
            console.log('App resumed, checking redirect result with delay...');
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.authService.checkRedirectResult(true).catch(error => {
              console.error('Error handling redirect result on resume:', error);
            });
            this.isProcessingRedirect = false;
          }
        }).catch(error => console.error('Error adding appStateChange listener:', error));

        App.addListener('appUrlOpen', async (data) => {
          console.log('App URL opened:', data.url);
          if (data.url.includes('firebaseapp.com/__/auth/handler') && !this.isProcessingRedirect) {
            this.isProcessingRedirect = true;
            console.log('Firebase redirect detected, processing with delay...');
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.authService.checkRedirectResult(true).catch(error => {
              console.error('Error handling deep link redirect:', error);
            });
            this.isProcessingRedirect = false;
          } else if (data.url.includes('msauth://')) {
            console.warn('Unexpected MSAL redirect detected:', data.url);
          }
        }).catch(error => console.error('Error adding appUrlOpen listener:', error));
      }
    }).catch(error => console.error('Error with platform.ready:', error));
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}