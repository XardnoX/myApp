import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
interface UserWidgetData {
  paid: boolean;
  owe: boolean;}
@Injectable({
  providedIn: 'root',
})
export class PaidService {
  private apiUrl = 'http://localhost:8100';
  constructor(private firestore: AngularFirestore, private http: HttpClient) {}
getUsersByWidget(widgetId: string): Observable<any[]> {
  return this.firestore
    .collection('user_has_widgets', (ref) => ref.where('widget_id', '==', `/widgets/${widgetId}`))
    .snapshotChanges()
    .pipe(
      map((changes) =>
        changes.map((c) => ({
          id: c.payload.doc.id, // The document ID in the user_has_widgets collection
          ...(c.payload.doc.data() as {}), // All fields in the document
        })) )    );}
        
getWidgetsByClass(userClass: string): Observable<any[]> {
  return this.firestore.collection('widgets', (ref) =>
    ref.where('class', '==', userClass)
  )
  .snapshotChanges()
  .pipe(
    map((changes) =>
      changes.map((c) => ({
        id: c.payload.doc.id, // Ensure 'id' is extracted correctly
        ...(c.payload.doc.data() as {}),
      }))
    )
  );
}
}
