import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class WidgetsService {
  constructor(private firestore: AngularFirestore) {}

  async getUserWidgetData(userId: string, widgetId: string): Promise<any | null> {
    try {
      const formattedUserId = `/users/${userId}`; // Ensure the format matches the database
      const formattedWidgetId = `/widgets/${widgetId}`; // Ensure the format matches the database
  
      console.log('Formatted User ID:', formattedUserId);
      console.log('Formatted Widget ID:', formattedWidgetId);
  
      const userHasWidgetsRef = this.firestore.collection('user_has_widgets', (ref) =>
        ref
          .where('user_id', '==', formattedUserId)
          .where('widget_id', '==', formattedWidgetId)
      );
  
      const snapshot = await userHasWidgetsRef.get().toPromise();
  
      if (snapshot && !snapshot.empty) {
        const doc = snapshot.docs[0];
        console.log('Document found:', doc.data());
        return { id: doc.id, ...(doc.data() as object) }; // Combine document ID and data
      } else {
        console.warn(`No record found for user_id: ${formattedUserId} and widget_id: ${formattedWidgetId}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user_has_widgets data:', error);
      return null;
    }
  }

    deleteWidget(widgetId: string): Promise<void> {
      return this.firestore
        .doc(`widgets/${widgetId}`)
        .delete()
        .then(() => console.log(`Widget ${widgetId} deleted successfully.`))
        .catch((error) => console.error('Error deleting widget:', error));
    }
  
    // Delete all relations for a widget in "user_has_widgets"
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
        .then(() => console.log(`Relations for widget ${widgetId} deleted successfully.`))
        .catch((error) => console.error('Error deleting relations:', error));
    }
  }

