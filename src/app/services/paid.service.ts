import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class PaidService {
  private apiUrl = 'http://localhost:8100';
  constructor(private firestore: AngularFirestore, private http: HttpClient) {}

  // Get widgets for a specific user and class from Firestore
  getWidgetsByUserAndClass(userId: string, userClass: string): Observable<any[]> {
    const widgetsRef = this.firestore.collection('widgets', ref => 
      ref.where('class', '==', userClass).where('userId', '==', userId)
    );

    return widgetsRef.valueChanges(); // Fetch widgets for user and class from Firestore
  }

  // Get users assigned to a specific widget from Firestore
  getUsersByWidget(widgetId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/payments?widgetId=${widgetId}`);


  }
  getWidgetsByClass(userClass: string): Observable<any[]> {
    return this.firestore.collection('widgets', (ref) =>
      ref.where('class', '==', userClass)
    ).valueChanges();
  }
}
