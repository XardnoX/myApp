import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const auth = getAuth();

    return new Promise((resolve) => {
     
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(true);
        } else {
          console.warn('User not authenticated, redirecting to /home');
          resolve(this.router.createUrlTree(['/home']));
        }
      }, (error) => {
        console.error('Auth state error:', error);
        resolve(this.router.createUrlTree(['/home']));
      });
    });
  }
}