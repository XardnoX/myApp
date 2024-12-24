import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';  // Firebase module
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WidgetsService {
  constructor(private firestore: AngularFirestore) { }

  // Fetch widgets by class from Firestore
  getWidgetsByClass(userClass: string): Observable<any[]> {
    return this.firestore.collection('widgets', ref => ref.where('class', '==', userClass)).valueChanges();
  }
}
