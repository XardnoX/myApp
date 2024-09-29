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
  constructor(private afAuth: AngularFireAuth, private router: Router, private http: HttpClient) { }

  // Function to check if the user exists in the database
  checkUserInDatabase(email: string): Observable<any> {
    // Make an HTTP request to your backend API (PHP script) to check if the email exists
    return this.http.post('http://databasepokladna.euweb.cz/user.php', { email });
  }

  async loginWithMicrosoft() {
    const provider = new firebase.auth.OAuthProvider('microsoft.com');

    try {
      const result = await this.afAuth.signInWithPopup(provider);
      if (result.user) {
        const email = result.user.email;

        if (email) {
          // Call checkUserInDatabase to check if the email exists
          this.checkUserInDatabase(email).subscribe((response: any) => {
            if (response && response.exists) {
              const userClass = response.userClass; // Assuming the backend returns the user's class
              // Navigate to notifications page with the user's class
              this.router.navigate([`/notifications/${userClass}`]);
            } else {
              console.error('Login restricted: User not found in the database.');
              this.router.navigate(['login-restricted']);
            }
          }, (error) => {
            console.error('Error checking user in database:', error);
          });
        } else {
          console.error('No email associated with the account.');
        }
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
    }
  }

  // Function to log the user out
  logout() {
    this.afAuth.signOut();
  }
}
