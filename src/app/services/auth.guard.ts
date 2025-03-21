import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const userId = localStorage.getItem('userId');
    console.log('AuthGuard: userId=', userId, 'Route=', state.url);
    if (userId) {
      console.log('AuthGuard: User is logged in, checking route...');
      return true;
    }
    console.log('AuthGuard: User is not logged in, redirecting to /home');
    return this.router.createUrlTree(['/home']);
  }
}