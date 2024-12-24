import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: AngularFirestore) {}

  // Get user by ID
  getUsers(): Observable<any[]> {
    return this.firestore.collection('users').valueChanges({ idField: 'id' });
  }

  // Get all widgets
  getAllWidgets(): Observable<any[]> {
    return this.firestore.collection('widgets').valueChanges({ idField: 'id' });
  }

  // Get all notifications
  getNotificationsByClass(userClass: string): Observable<any[]> {
    return this.firestore.collection('notifications', (ref) =>
      ref.where('class', '==', userClass)
    ).valueChanges();
  }

  // Get user_has_widget data
  getUserWidgets(userId: string): Observable<any[]> {
    return this.firestore.collection('user_has_widget', (ref) =>
      ref.where('user_id', '==', `/users/${userId}`)
    ).valueChanges();
  }
  getUsersByClass(userClass: string): Observable<any[]> {
    return this.firestore.collection('users', (ref) =>
      ref.where('class', '==', userClass)
    ).valueChanges();
  }
}
