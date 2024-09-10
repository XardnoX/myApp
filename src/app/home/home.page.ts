// src/app/home/home.page.ts

import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
})
export class HomePage {
  user$ = this.afAuth.authState;

  constructor(private authService: AuthService, private afAuth: AngularFireAuth) { }

  login() {
    this.authService.loginWithMicrosoft();
  }

  logout() {
    this.authService.logout();
  }
}
