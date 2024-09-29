import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WidgetsService {

  constructor(private http: HttpClient) { }

  // Method to get widgets by user class
  getWidgetsByClass(userClass: string): Observable<any[]> {
    return this.http.get<any[]>(`http://sql6.webzdarma.cz:3306/widgets?class=${userClass}`);
  }
}
