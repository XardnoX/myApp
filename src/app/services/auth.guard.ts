import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { getAuth, onAuthStateChanged, Unsubscribe } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private unsubscribeAuth: Unsubscribe | null = null;

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const auth = getAuth();

    return from(new Promise<boolean | UrlTree>((resolve) => {
      const user = auth.currentUser;
      if (user) {
        resolve(true);
      } else {
        this.unsubscribeAuth = onAuthStateChanged(auth, (newUser) => {
          if (newUser) {
            resolve(true);
          } else {
            console.warn('User not authenticated, redirecting to /home');
            resolve(this.router.createUrlTree(['/home']));
          }
          if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
            this.unsubscribeAuth = null;
          }
        }, (error) => {
          console.error('Auth state error:', error);
          resolve(this.router.createUrlTree(['/home']));
          if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
            this.unsubscribeAuth = null;
          }
        });
      }
    }));
  }
}