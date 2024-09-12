import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WidgetsService {

  constructor(private http: HttpClient) { }
  getWidgetsByClass(userClass: string): Observable<any> {
    return this.http.get<any[]>(`http://localhost:8100/widgets?class=${userClass}`);
  }
}
