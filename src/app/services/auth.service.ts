import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userId: number | null = null; // uložení userId do paměti

  constructor(private afAuth: AngularFireAuth, private router: Router, private http: HttpClient) {}

  // funkce na ověření jeslti uživatel existuje
  checkUserInDatabase(email: string): Observable<any> {
    // request na backend API pro kontrolu jestli email existuje
    return this.http.post('http://databasepokladna.euweb.cz/user.php', { email });
  }

  async loginWithMicrosoft() {
    const provider = new firebase.auth.OAuthProvider('microsoft.com');

    try {
      const result = await this.afAuth.signInWithPopup(provider);
      if (result.user) {
        const email = result.user.email;

        if (email) {
          // zavolání checkUserInDatabase
          this.checkUserInDatabase(email).subscribe(
            (response: any) => {
              if (response && response.exists) {
                const userClass = response.userClass; // předpoklad, že backend vrátí userClass
                const userId = response.userId; // předpoklad, že backend vrátí userId
                this.userId = userId; 
                localStorage.setItem('userId', String(userId)); // uložení do lokální paměti
                console.log('User ID stored:', userId);

                // přesměruje na stránku notification/(userClass)
                this.router.navigate([`/notifications/${userClass}`]);
              } else {
                console.error('Login restricted: User not found in the database.');
                this.router.navigate(['login-restricted']);
              }
            },
            (error) => {
              console.error('Error checking user in database:', error);
            }
          );
        } else {
          console.error('No email associated with the account.');
        }
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
    }
  }

  // funkce která vrátí userId z lokální paměti
  getUserId(): number | null {
    if (!this.userId) {
      this.userId = parseInt(localStorage.getItem('userId') || '0', 10);
    }
    return this.userId;
  }

  // funkce, která odhlásí uživatele
  logout() {
    this.afAuth.signOut();
    this.userId = null; // uvolnění userId z paměti
    localStorage.removeItem('userId'); // odstranění userId z paměti
  }
}
