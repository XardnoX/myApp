import { NavigationClient } from '@azure/msal-browser';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Capacitor, Plugins } from '@capacitor/core';
const { App } = Plugins;

export class CustomNavigationClient extends NavigationClient {
  constructor(private iab: InAppBrowser) {
    super();
  }

  override async navigateExternal(url: string, options: any) {
    if (Capacitor.isNativePlatform()) {
      // This is where the InAppBrowser is created
      const browser = this.iab.create(url, '_blank', {
        location: 'yes',
        clearcache: 'yes',
        clearsessioncache: 'yes',
        hidenavigationbuttons: 'yes',
        hideurlbar: 'yes',
        fullscreen: 'yes',
        hardwareback: 'yes',
        usewkwebview: 'yes', // For iOS, if needed
      });

      browser.on('loadstart').subscribe(event => {
        console.log('Loadstart event URL:', event.url);
        if (event.url.startsWith('msauth://io.ionic.com')) {
          console.log('Redirect detected:', event.url);
          // Log the query parameters or fragment to debug
          const urlObj = new URL(event.url.replace('#', '?')); // Convert fragment to query for easier parsing
          console.log('Parsed URL parameters:', urlObj.searchParams.toString());
          setTimeout(() => {
            browser.close();
            App['openUrl']({ url: event.url });
            console.log('Redirect URL passed to App:', event.url);
          }, 500);
        }
      });

      browser.on('loaderror').subscribe(error => {
        console.error('InAppBrowser loaderror:', error);
      });

      browser.on('exit').subscribe(() => {
        console.log('InAppBrowser exited');
      });

      browser.on('loaderror').subscribe(error => {
        console.error('InAppBrowser loaderror:', error);
      });

      browser.on('exit').subscribe(() => {
        console.log('InAppBrowser exited');
      });
    } else {
      if (options.noHistory) {
        window.location.replace(url);
      } else {
        window.location.assign(url);
      }
    }
    return true;
  }
}