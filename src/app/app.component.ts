import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { msalConfig } from '../msal.config';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  isDarkMode = false;
  constructor(private platform: Platform, private authService: AuthService) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      console.log('Platform ready');
      this.setupDeepLinkListener();
    }).catch(err => console.error('Platform ready error:', err));
  }

  ngOnInit() {
    App.addListener('appUrlOpen', async (event) => {
      console.log('appUrlOpen event:', event);
      if (event.url.startsWith(msalConfig.auth.redirectUri)) {
        console.log('Handling redirect with URL:', event.url);
        await this.authService.handleMsalRedirect(event.url);
      } else {
        console.log('URL does not match redirectUri:', event.url);
      }
    }).catch(err => console.error('Failed to add appUrlOpen listener:', err));
  }

  private setupDeepLinkListener() {
    App.addListener('appUrlOpen', async (event) => {
      console.log('App URL Open event triggered:', event.url);
      if (event.url.startsWith(msalConfig.auth.redirectUri)) {
        console.log('Redirect URL matches, passing to handleMsalRedirect');
        await this.authService.handleMsalRedirect(event.url);
      } else {
        console.log('URL does not match redirectUri:', msalConfig.auth.redirectUri);
      }
    }).catch(err => console.error('Failed to add appUrlOpen listener:', err));

    App.addListener('appStateChange', async (state) => {
      console.log('App state changed:', state);
      if (state.isActive) {
        console.log('App resumed, checking MSAL redirect...');
        await this.authService.handleMsalRedirect();
      }
    }).catch(err => console.error('Failed to add appStateChange listener:', err));
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}