// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) { }

  async loginWithMicrosoft() {
    const provider = new firebase.auth.OAuthProvider('microsoft.com');

    try {
      const result = await this.afAuth.signInWithPopup(provider);
      console.log('User info:', result.user);
    } catch (error) {
      console.error('Microsoft login error:', error);
    }
  }

  logout() {
    this.afAuth.signOut();
  }
}
