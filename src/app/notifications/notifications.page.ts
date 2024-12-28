import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PaidService } from '../services/paid.service';
import { WidgetUsersModalComponent } from '../modals/widget-users-modal/widget-users-modal.component';
import { AuthService } from '../services/auth.service';
import { WidgetsService } from '../services/widgets.service';
interface UserWidgetData {
  paid: boolean;
  owe: boolean;
}
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
    private paidService: PaidService,
    private authService: AuthService,
    private widgetsService: WidgetsService
  ) {}

  async ngOnInit() {
    try {
      // Retrieve userId and userClass from localStorage
      this.userId = localStorage.getItem('userId');
      this.userClass = localStorage.getItem('userClass') ?? undefined;
  
      if (!this.userId) {
        console.error('User ID not found in localStorage.');
        return;
      }
  
      if (!this.userClass) {
        console.error('User class not found in localStorage.');
        return;
      }
  
      // Load widgets for the userClass
      this.loadWidgetsForClass(this.userClass);
    } catch (error) {
      console.error('Error initializing NotificationsPage:', error);
    }
  }
  
  

  loadWidgetsForClass(userClass: string) {
    this.paidService
      .getWidgetsByClass(userClass)
      .subscribe(
        async (allWidgets: any[]) => {
          console.log('Fetched Widgets:', allWidgets);

          if (this.userId) {
            this.widgets = await this.mergeUserWidgetData(allWidgets);
          }
        },
        (error) => {
          console.error('Error fetching widgets:', error);
        }
      );
  }

  async mergeUserWidgetData(widgets: any[]): Promise<any[]> {
    try {
      console.log('Widgets passed to mergeUserWidgetData:', widgets);
  
      if (!this.userId) {
        console.warn('User ID is missing. Skipping merge.');
        return widgets.map((widget) => ({ ...widget, paid: false, owe: false }));
      }
  
      const mergedWidgets = await Promise.all(
        widgets.map(async (widget) => {
          try {
            const widgetId = widget.id;
            console.log(`Fetching data for Widget ID: ${widgetId} and User ID: ${this.userId}`);
  
            const userWidgetData = await this.widgetsService.getUserWidgetData(this.userId!, widgetId);
  
            console.log('User Widget Data:', userWidgetData);
  
            // Merge the user-widget data with the widget data
            return {
              ...widget,
              paid: userWidgetData?.paid ?? false,
              owe: userWidgetData?.owe ?? false,
            };
          } catch (error) {
            console.error(`Error fetching data for widget ID: ${widget.id}`, error);
            return {
              ...widget,
              paid: false,
              owe: false, // Defaults if error occurs
            };
          }
        })
      );
  
      console.log('Final Merged Widgets:', mergedWidgets);
      return mergedWidgets;
    } catch (error) {
      console.error('Error in mergeUserWidgetData:', error);
      return widgets.map((widget) => ({ ...widget, paid: false, owe: false }));
    }
  }
  logout() {
    this.authService.logout();
  }
  async openWidgetUsersModal(widgetId: string) {
    const modal = await this.modalController.create({
      component: WidgetUsersModalComponent,
      componentProps: { widgetId },
    });
    return await modal.present();
  }
}
