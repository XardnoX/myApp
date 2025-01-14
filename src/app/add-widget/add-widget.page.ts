import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

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
  userClass: string | undefined;

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    public router: Router,
    private menuController: MenuController // Added MenuController for menu handling
  ) {}

  async ngOnInit() {
    try {
      // Retrieve userId and userClass from localStorage
      this.userClass = localStorage.getItem('userClass') ?? undefined;

      if (!this.userClass) {
        console.error('User class not found in localStorage.');
        return;
      }
    } catch (error) {
      console.error('Error during ngOnInit:', error);
    }
  }

  logout() {
    this.authService.logout();
  }

  toggleMenu() {
    this.menuController.toggle('add-widget-menu'); // Use the specific menuId
  }
  
  closeMenu() {
    this.menuController.close('add-widget-menu'); // Use the specific menuId
  }
  
  
  async createWidget() {
    try {
      // Get class from localStorage
      const userClass = localStorage.getItem('userClass');
      if (!userClass) {
        throw new Error('User class not found in localStorage.');
      }

      // Validation: Check required fields
      if (!this.widgetName || !this.widgetPrice || !this.endDate) {
        alert('Please fill in all required fields: Name, Price, and End Date.');
        return;
      }

      // Automatically set start time to 00:01 and end time to 23:59
      const formattedStart = this.startDate
        ? this.setTimeTo(this.startDate, 0, 1) // Set start time to 00:01
        : this.setTimeTo(new Date().toISOString(), 0, 1); // Default to current date
      const formattedEnd = this.setTimeTo(this.endDate, 23, 59); // Set end time to 23:59

      // Validate that `end` is after `start`
      if (new Date(formattedEnd) <= new Date(formattedStart)) {
        alert('End date must be after the start date.');
        return;
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
        description: this.widgetDescription || '', // Default to empty string if not provided
        price: this.widgetPrice,
        start: formattedStart,
        end: formattedEnd,
        class: userClass,
        full_paid: false
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

      // Reset all form fields after successful creation
      this.resetFormFields();
      this.router.navigate([`/notifications/${userClass}`]);

    } catch (error) {
      console.error('Error creating widget:', error);
      alert('Error creating widget. Check console for details.');
    }
  }

  // Utility function to set specific time to a date
  private setTimeTo(dateString: string, hours: number, minutes: number): string {
    const date = new Date(dateString);
    date.setHours(hours, minutes, 0, 0); // Set hours, minutes, seconds, milliseconds
    return date.toISOString();
  }

  // Utility function to reset form fields
  private resetFormFields() {
    this.widgetName = '';
    this.widgetDescription = '';
    this.widgetPrice = null;
    this.startDate = '';
    this.endDate = '';
  }
}


