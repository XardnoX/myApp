import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-widget',
  templateUrl: './add-widget.page.html',
  styleUrls: ['./add-widget.page.scss'],
})
export class AddWidgetPage {
  widgetName = '';
  widgetDescription = '';
  widgetPrice: number | null = null;
  startDate: string = '';
  endDate: string = '';
  authService: any;
  userClass: string | undefined;

  constructor(private firestore: AngularFirestore, public router: Router) {}

  async ngOnInit() {
    try {
      // Retrieve userId and userClass from localStorage
  
      this.userClass = localStorage.getItem('userClass') ?? undefined;
  
  
      if (!this.userClass) {
        console.error('User class not found in localStorage.');
        return;
      }
  
      // Load widgets for the userClass

      } catch (error) {
        console.error('Error during ngOnInit:', error);
      }
    }
  logout() {
    this.authService.logout();
  }
  async createWidget() {
    try {
      // Get class from localStorage
      const userClass = localStorage.getItem('userClass');
      if (!userClass) {
        throw new Error('User class not found in localStorage.');
      }

      // Fetch all users with the same class
      const usersSnapshot = await this.firestore
        .collection('users', (ref) => ref.where('class', '==', userClass))
        .get()
        .toPromise();

      if (!usersSnapshot || usersSnapshot.empty) {
        throw new Error('No users found for the class.');
      }

      // Create the widget in the "widgets" collection
      const widgetDoc = await this.firestore.collection('widgets').add({
        name: this.widgetName,
        description: this.widgetDescription,
        price: this.widgetPrice,
        start: this.startDate,
        end: this.endDate,
        class: userClass,
      });

      console.log('Widget created with ID:', widgetDoc.id);

      // Create relationships in "user_has_widgets" for each user
      const batch = this.firestore.firestore.batch();
      usersSnapshot.forEach((userDoc) => {
        const relationshipRef = this.firestore
          .collection('user_has_widgets')
          .doc().ref;

        batch.set(relationshipRef, {
          user_id: `/users/${userDoc.id}`,
          widget_id: `/widgets/${widgetDoc.id}`,
          paid: false, // Default to false
          owe: false, // Default to false
        });
      });

      // Commit the batch
      await batch.commit();

      console.log('Relationships created successfully.');
      alert('Widget and relationships created successfully!');
      this.router.navigate([`/notifications/${userClass}`]);
      // Redirect to another page (e.g., widgets list)

    } catch (error) {
      console.error('Error creating widget:', error);
      alert('Error creating widget. Check console for details.');
    }
  }
}
