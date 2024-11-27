import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaidService {
  private apiUrl = 'http://databasepokladna.euweb.cz/user_has_widget.php';

  constructor(private http: HttpClient) {}

  // spojení widgetů pomocí userId a Class
  getWidgetsByUserAndClass(userId: number): Observable<any> {
    const url = `${this.apiUrl}?userId=${userId}`;
    console.log('Fetching widgets for user and class from URL:', url);
    return this.http.get<any>(url); // Use HTTP GET to fetch data
  }
  getUsersByWidget(widgetId: number): Observable<any> {
    const url = `http://databasepokladna.euweb.cz/widget_modal.php?widgetId=${widgetId}`;
    return this.http.get<any>(url);
  }
}
