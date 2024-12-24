import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PaidService {
  private apiUrl = 'http://localhost:8100';
  constructor(private firestore: AngularFirestore, private http: HttpClient) {}

  // Get widgets for a specific user and class from Firestore
  getUserWidgets(userId: string): Observable<any[]> {
    return this.firestore
      .collection('user_has_widgets', (ref) => ref.where('user_id', '==', `/users/${userId}`))
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            id: c.payload.doc.id,
            ...(c.payload.doc.data() as {}),
          }))
        )
      );
  }
  

  // Get users assigned to a specific widget from Firestore
  // Get users assigned to a specific widget from Firestore
getUsersByWidget(widgetId: string): Observable<any[]> {
  return this.firestore
    .collection('user_has_widgets', (ref) => ref.where('widget_id', '==', `/widgets/${widgetId}`))
    .snapshotChanges()
    .pipe(
      map((changes) =>
        changes.map((c) => ({
          id: c.payload.doc.id, // The document ID in the user_has_widgets collection
          ...(c.payload.doc.data() as {}), // All fields in the document
        }))
      )
    );
}

  getWidgetsByClass(userClass: string): Observable<any[]> {
    return this.firestore.collection('widgets', (ref) =>
      ref.where('class', '==', userClass)
    ).valueChanges();
  }
}
