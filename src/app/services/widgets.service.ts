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
  
}
