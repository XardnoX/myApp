import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { WidgetUsersModalComponent } from '../modals/widget-users-modal/widget-users-modal.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  widgets: any[] = [];
  userClass: string | undefined;
  userId: string | null = null;

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    try {
      // Fetch userClass and userId from AuthService
      this.userId = this.authService.getUserId();
      const userClass = await this.authService.getUserClass();

      if (userClass && this.userId) {
        this.userClass = userClass;
        this.loadWidgetsForClass(userClass);
      } else {
        console.error('User class or user ID not found.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  loadWidgetsForClass(userClass: string) {
    // Fetch widgets where the class matches the user's class
    this.firestore
      .collection('widgets', (ref) => ref.where('class', '==', userClass))
      .snapshotChanges()
      .subscribe(
        async (allWidgets: any[]) => {
          const widgetData = allWidgets.map((w) => ({
            id: w.payload.doc.id,
            ...(w.payload.doc.data() as {}),
          }));

          // Merge user_has_widgets data for each widget
          if (this.userId) {
            this.widgets = await this.mergeUserWidgetData(widgetData);
          }
        },
        (error) => {
          console.error('Error fetching widgets:', error);
        }
      );
  }

  async mergeUserWidgetData(widgets: any[]) {
    const mergedWidgets = [];
    for (const widget of widgets) {
      const widgetId = `/widgets/${widget.id}`;
      const userId = `/users/${this.userId}`;
      console.log('Querying for Widget ID:', widgetId);
      console.log('Querying for User ID:', userId);
  
      const userWidgetSnapshot = await this.firestore
        .collection('user_has_widgets', (ref) =>
          ref.where('widget_id', '==', widgetId).where('user_id', '==', userId)
        )
        .get()
        .toPromise();
  
      let paid = widget.paid;
      let owe = widget.owe;
  
      if (userWidgetSnapshot && !userWidgetSnapshot.empty) {
        console.log('User Widget Snapshot Found:', userWidgetSnapshot.docs);
  
        const userWidget = userWidgetSnapshot.docs[0].data() as {
          paid: boolean;
          owe: boolean;
        };
  
        console.log('User Widget Data:', userWidget);
  
        paid = userWidget.paid;
        owe = userWidget.owe;
      } else {
        console.warn(`No matching user-widget record found for Widget ID: ${widgetId} ${userId}`);
      }
  
      mergedWidgets.push({
        ...widget,
        paid,
        owe,
      });
    }
  
    console.log('Final Merged Widgets:', mergedWidgets);
    return mergedWidgets;
  }
  
  
  
  
  async openWidgetUsersModal(widgetId: string) {
    const modal = await this.modalController.create({
      component: WidgetUsersModalComponent,
      componentProps: { widgetId },
    });
    return await modal.present();
  }
}
