import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaidService {
  private apiUrl = 'http://databasepokladna.euweb.cz/user_has_widget.php';

  constructor(private http: HttpClient) {}

  // Fetch widgets by user ID and class
  getWidgetsByUserAndClass(userId: number, userClass: string): Observable<any> {
    const url = `${this.apiUrl}?userId=${userId}&class=${userClass}`;
    console.log('Fetching widgets for user and class from URL:', url);
    return this.http.get<any>(url); // Use HTTP GET to fetch data
  }
}
