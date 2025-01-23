import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap, combineLatest, first } from 'rxjs';

interface Widget {
  full_paid?: boolean; 
}
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
          const userRequests = userWidgetRelations.map((relation) => {
            const userId = relation.user_id.replace('/users/', '');
            return this.firestore
              .doc<{ email: string }>(`users/${userId}`)
              .valueChanges()
              .pipe(
                map((user) => ({
                  ...relation,
                  email: user?.email || 'Unknown', 
                }))
              );
          });
  

          return combineLatest(userRequests.length ? userRequests : [of([])]);
        })
      );
  }

  
  checkAndSetFullPaidOnce(widgetId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getUsersForWidget(widgetId).subscribe(
        (userWidgets) => {
          const allPaid = userWidgets.every((userWidget) => userWidget.paid === true);
  
          this.firestore
            .doc(`widgets/${widgetId}`)
            .get()
            .pipe(first())
            .subscribe((doc) => {
              if (doc.exists) {
                const widgetData = doc.data() as Widget;
                const currentFullPaid = widgetData.full_paid;
  
                if (currentFullPaid !== allPaid) {
                  this.firestore
                    .doc(`widgets/${widgetId}`)
                    .update({ full_paid: allPaid })
                    .then(() => {
                      console.log(`Widget ${widgetId} full_paid updated to ${allPaid}`);
                      resolve();
                    })
                    .catch((error) => {
                      console.error(`Error updating full_paid for widget ${widgetId}:`, error);
                      reject(error);
                    });
                } else {
                  resolve();
                }
              } else {
                console.error(`Widget ${widgetId} does not exist.`);
                resolve();
              }
            });
        },
        (error) => {
          console.error(`Error fetching users for widget ${widgetId}:`, error);
          reject(error);
        }
      );
    });
  }
 
        
getWidgetsByClass(userClass: string): Observable<any[]> {
  return this.firestore.collection('widgets', (ref) =>
    ref.where('class', '==', userClass)
  )
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
}
