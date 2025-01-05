import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap, combineLatest } from 'rxjs';

interface UserWidgetData {
  paid: boolean;
  owe: boolean;}
@Injectable({
  providedIn: 'root',
})
export class PaidService {
  private apiUrl = 'http://localhost:8100';
  constructor(private firestore: AngularFirestore, private http: HttpClient) {}
  
  getUsersForWidget(widgetId: string): Observable<any[]> {
    return this.firestore
      .collection('user_has_widgets', (ref) =>
        ref.where('widget_id', '==', `/widgets/${widgetId}`)
      )
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => {
            const data = c.payload.doc.data() as {
              user_id: string;
              paid: boolean;
              owe: boolean;
            };
            const id = c.payload.doc.id;
  
            return {
              id,
              ...data,
            };
          })
        ),
        switchMap((userWidgetRelations) => {
          // Create an array of Observables for fetching user data
          const userRequests = userWidgetRelations.map((relation) => {
            const userId = relation.user_id.replace('/users/', ''); // Extract user document ID
            return this.firestore
              .doc<{ email: string }>(`users/${userId}`)
              .valueChanges()
              .pipe(
                map((user) => ({
                  ...relation,
                  email: user?.email || 'Unknown', // Add the user's email or 'Unknown' if null
                }))
              );
          });
  
          // Combine all Observables into a single Observable
          return combineLatest(userRequests.length ? userRequests : [of([])]);
        })
      );
  }
  
  
        
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
