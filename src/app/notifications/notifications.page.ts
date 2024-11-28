import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WidgetsService } from '../services/widgets.service';
import { PaidService } from '../services/paid.service';
import { AuthService } from '../services/auth.service'; 
import { ModalController } from '@ionic/angular';
import { WidgetUsersModalComponent } from '../modals/widget-users-modal/widget-users-modal.component';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  userClass: string | undefined;
  userId: number | null = null; 
  widgets: any[] = []; // pole, které obsahuje widgety a podrobnosti a zaplacení

  constructor(
    private route: ActivatedRoute,
    private widgetsService: WidgetsService,
    private paidService: PaidService,
    private authService: AuthService, // Inject the AuthService to get the userId
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.fetchUserIdAndLoadWidgets();
  }

  // spojení userId ze session a načte widgety
  fetchUserIdAndLoadWidgets() {
    this.userId = this.authService.getUserId(); 
    console.log('Fetched userId from session:', this.userId);

    if (!this.userId) {
      console.error('User ID is not available. Ensure the user is logged in.');
      return;
    }

    this.route.paramMap.subscribe((params) => {
      const userClassParam = params.get('userClass');
      if (userClassParam) {
        this.userClass = userClassParam;
        console.log('Class from route params:', this.userClass);

        // načte widgety a podrobnosti o zaplacení
        if (this.userId && this.userClass) {
          this.loadWidgetsAndPayments(this.userClass, this.userId);
        } else {
          console.error('User ID or User Class is missing.');
        }
      } else {
        console.error('No user class found in the route parameters.');
      }
    });
  }

  // načte widgety ze stejné userClass
  loadWidgetsAndPayments(userClass: string, userId: number) {
    console.log(`Loading widgets for class "${userClass}" and payment info for user ID: ${userId}`);

    this.widgetsService.getWidgetsByClass(userClass).subscribe(
      (response) => {
        if (response && Array.isArray(response.widgets)) {
          console.log('Widgets loaded from service:', response.widgets);

        
          this.widgets = response.widgets;

          this.loadPaymentInfo(userId);
        } else {
          console.error('Invalid response format for widgets:', response);
          this.widgets = [];
        }
      },
      (error) => {
        console.error('Error fetching widgets:', error);
      }
    );
  }

  loadPaymentInfo(userId: number) {
    console.log(`Fetching payment information for user ID: ${userId}`);

    this.paidService.getWidgetsByUserAndClass(userId).subscribe(
      (response) => {
        if (response && Array.isArray(response.widgets)) {
          console.log('Payment info loaded:', response.widgets);

          this.widgets = this.widgets.map((widget) => {
            const paymentInfo = response.widgets.find(
              (p: { widget_id: any }) => p.widget_id === widget.idwidget
            );
            return {
              ...widget,
              paid: paymentInfo ? (paymentInfo.widget_paid === 1 ? 'Ano' : 'Ne') : 'Ne',
              owe: paymentInfo ? (paymentInfo.widget_owe === 1 ? 'Ano' : 'Ne') : 'Ne',
            };
          });

          console.log('Updated widgets with payment info:', this.widgets);
        } else {
          console.error('Invalid response format for payment info:', response);
        }
      },
      (error) => {
        console.error('Error fetching payment information:', error);
      }
    );
  }
  async openWidgetUsersModal(widgetId: number) {
    const modal = await this.modalController.create({
      component: WidgetUsersModalComponent,
      componentProps: {
        widgetId: widgetId, // předá widgetId modalu
      },
    });
  
    await modal.present();
  }
  
}
