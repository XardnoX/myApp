import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class WidgetsService {
  constructor(private firestore: AngularFirestore) {}

  async getUserWidgetData(userId: string, widgetId: string): Promise<any | null> {
    try {
      const formattedUserId = `/users/${userId}`;
      const formattedWidgetId = `/widgets/${widgetId}`;
  
      const userHasWidgetsRef = this.firestore.collection('user_has_widgets', (ref) =>
        ref
          .where('user_id', '==', formattedUserId)
          .where('widget_id', '==', formattedWidgetId)
      );
  
      const snapshot = await userHasWidgetsRef.get().toPromise();
  
      if (snapshot && !snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...(doc.data() as object) };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Cyba při načítání spojených akcí s uživatelem', error);
      return null;
    }
  }

    deleteWidget(widgetId: string): Promise<void> {
      return this.firestore
        .doc(`widgets/${widgetId}`)
        .delete()
        .catch((error) => console.error('Chyba při mazání akce:', error));
    }
  
    async deleteWidgetRelations(widgetId: string): Promise<void> {
      const relationsRef = this.firestore.collection('user_has_widgets', (ref) =>
        ref.where('widget_id', '==', `/widgets/${widgetId}`)
      );
  
      const snapshot = await relationsRef.get().toPromise();
      const batch = this.firestore.firestore.batch();
  
      snapshot?.forEach((doc) => {
        batch.delete(doc.ref);
      });
  
      return batch
        .commit()
        .catch((error) => console.error('Chyba při mazání relací:', error));
    }
  }

