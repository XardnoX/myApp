import { Injectable } from '@angular/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {}

  private isSupportedPlatform(): boolean {
    const platform = Capacitor.getPlatform();
    return platform === 'android' || platform === 'ios';
  }

  async getFCMToken(): Promise<string | null> {
    if (!this.isSupportedPlatform()) {
      return null;
    }

    try {
      const permissionStatus = await PushNotifications.requestPermissions();
      if (permissionStatus.receive === 'granted') {
        await PushNotifications.register();

        return new Promise((resolve, reject) => {
          PushNotifications.addListener('registration', (token: Token) => {
            console.log('FCM Token:', token.value);
            resolve(token.value);
          });

          PushNotifications.addListener('registrationError', (error: any) => {
            console.error('Chyba registrace upozornění:', error);
            reject(null);
          });
        });
      } else {
        return null;
      }
    } catch (error) {
      console.error('Chyba při získávání FCM token:', error);
      return null;
    }
  }

  async requestNotificationPermissions() {
    if (!this.isSupportedPlatform()) {
      return;
    }

    try {
      const permissionStatus = await PushNotifications.requestPermissions();
      if (permissionStatus.receive === 'granted') {
        await PushNotifications.register();

        PushNotifications.addListener('registration', (token) => {
          console.log('FCM Token:', token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Chyba registrace upozornění:', error);
        });
      } 
    } catch (error) {
      console.error('Chyba při získávání povolení pro upozornění:', error);
    }
  }

  listenForMessages() {
    if (!this.isSupportedPlatform()) {
      return;
    }

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Povolení pro upozornění bylo získano:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log(action);
    });
  }
}