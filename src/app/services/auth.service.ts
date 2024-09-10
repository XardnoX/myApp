// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private router: Router) { }

  async loginWithMicrosoft() {
    const provider = new firebase.auth.OAuthProvider('microsoft.com');

    try {
        const result = await this.afAuth.signInWithPopup(provider);
        if (result.user) {
          this.router.navigate(['notifications']); //tady bude později přidaná kategorie podle které uvidí uživatel stránku notifications
        }
      }catch (error) {
      console.error('Microsoft login error:', error);
    }
  }

  logout() {
    this.afAuth.signOut();
  }
}
