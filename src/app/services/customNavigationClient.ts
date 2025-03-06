import { NavigationClient } from '@azure/msal-browser';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Capacitor } from '@capacitor/core';

export class CustomNavigationClient extends NavigationClient {

  constructor(private iab: InAppBrowser) {
    super();
  }

  override async navigateExternal(url: string, options: any) {
    if (Capacitor.isNativePlatform()) {
      const browser = this.iab.create(url, '_blank', {
        location: 'yes',
        clearcache: 'yes',
        clearsessioncache: 'yes',
        hidenavigationbuttons: 'yes',
        hideurlbar: 'yes',
        fullscreen: 'yes'
      });

      browser.on('loadstart').subscribe(event => {
        if (event.url.startsWith('msauth://io.ionic.com')) {
          browser.close();
          window.location.href = event.url;
        }
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
