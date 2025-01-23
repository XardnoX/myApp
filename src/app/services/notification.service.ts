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
      console.warn('PushNotifications plugin is not supported on this platform.');
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
            console.error('Registration error:', error);
            reject(null);
          });
        });
      } else {
        console.warn('Push notification permissions denied.');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async requestNotificationPermissions() {
    if (!this.isSupportedPlatform()) {
      console.warn('PushNotifications plugin is not supported on this platform.');
      return;
    }

    try {
      const permissionStatus = await PushNotifications.requestPermissions();
      if (permissionStatus.receive === 'granted') {
        console.log('Push notification permissions granted.');
        await PushNotifications.register();

        PushNotifications.addListener('registration', (token) => {
          console.log('FCM Token:', token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Registration error:', error);
        });
      } else {
        console.warn('Push notification permissions denied.');
      }
    } catch (error) {
      console.error('Error requesting push notification permissions:', error);
    }
  }

  listenForMessages() {
    if (!this.isSupportedPlatform()) {
      console.warn('PushNotifications plugin is not supported on this platform.');
      return;
    }

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push notification action performed:', action);
    });
  }

  async requestWebNotificationPermissions() {
    if (Capacitor.getPlatform() === 'web') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Web push notifications permissions granted.');
        } else {
          console.warn('Web push notifications permissions denied.');
        }
      } catch (error) {
        console.error('Error requesting web notification permissions:', error);
      }
    }
  }

  showWebNotification(title: string, options?: NotificationOptions) {
    if (Capacitor.getPlatform() === 'web' && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }
}