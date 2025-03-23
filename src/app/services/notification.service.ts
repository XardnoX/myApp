import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private listenersInitialized = false;

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService
  ) {}

  private isSupportedPlatform(): boolean {
    const platform = Capacitor.getPlatform();
    console.log('Aktuální platforma:', platform);
    return platform === 'android' || platform === 'ios';
  }

  async requestNotificationPermissions(): Promise<boolean> {
    if (!this.isSupportedPlatform()) {
      console.log('Upozornění nejsou na této platformě podporována.');
      return false;
    }

    try {
      const permissionStatus = await PushNotifications.checkPermissions();
      if (permissionStatus.receive === 'prompt') {
        const result = await PushNotifications.requestPermissions();
        if (result.receive !== 'granted') {
          return false;
        }
      } else if (permissionStatus.receive === 'denied') {
        return false;
      }

      await PushNotifications.register();

      if (!this.listenersInitialized) {
        this.setupPushNotificationListeners();
        this.listenersInitialized = true;
      }

      return true;
    } catch (error: any) {
      console.error(error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    if (!this.isSupportedPlatform()) {
      return null;
    }

    try {
      const permissionStatus = await PushNotifications.checkPermissions();
      if (permissionStatus.receive === 'granted') {
        await PushNotifications.register();

        return new Promise((resolve, reject) => {
          let registrationListener: any;
          let errorListener: any;

          registrationListener = PushNotifications.addListener(
            'registration',
            (token: Token) => {
              console.log('FCM token získán:', token.value);
              const userId = this.authService.getUserId();
              if (userId) {
                this.firestoreService
                  .addFCMTokenToUser(userId, token.value)
                  .then(() => {
                    resolve(token.value);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              } else {
                resolve(token.value);
              }
              registrationListener.remove();
              errorListener.remove();
            }
          );

          errorListener = PushNotifications.addListener(
            'registrationError',
            (error: any) => {
              console.error(error);
              reject(error);
              registrationListener.remove();
              errorListener.remove();
            }
          );

          setTimeout(() => {
            registrationListener.remove();
            errorListener.remove();
          }, 10000);
        });
      } else {
        return null;
      }
    } catch (error: any) {
      console.error(error);
      return null;
    }
  }

  private setupPushNotificationListeners() {
    PushNotifications.addListener('registration', (token: Token) => {
      const userId = this.authService.getUserId();
      if (userId) {
        this.firestoreService.addFCMTokenToUser(userId, token.value)   
      }
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Registrace pro upozornění selhala:', error);
      
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        this.handleNotificationReceived(notification);
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        this.handleNotificationAction(action);
      }
    );
  }

  private handleNotificationReceived(notification: PushNotificationSchema) {
    const { title, body } = notification;
  }

  private handleNotificationAction(action: ActionPerformed) {
    const { actionId, notification } = action;
  }
}