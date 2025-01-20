import { Injectable } from '@angular/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {}

  async getFCMToken(): Promise<string | null> {
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
    // Listen for push notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      // TODO: Handle the notification (e.g., display it in-app)
    });

    // Handle actions when a notification is tapped
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push notification action performed:', action);
      // TODO: Handle the action (e.g., navigate to a specific page)
    });
  }
}
