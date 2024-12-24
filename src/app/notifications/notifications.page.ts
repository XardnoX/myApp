import { Component, OnInit } from '@angular/core';
import { PaidService } from '../services/paid.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  userClass: string | undefined;
  widgets: any[] = [];
  constructor(private paidService: PaidService, private authService: AuthService) {}

  ngOnInit() {
    // Fetch user class from AuthService
    this.authService.getUserClass().then((userClass) => {
      if (userClass) {
        this.userClass = userClass;
  
        // Fetch widgets for the user's class
        this.paidService.getWidgetsByClass(this.userClass).subscribe(
          (widgets) => {
            this.widgets = widgets;
            console.log('Widgets for class:', this.widgets);
          },
          (error) => {
            console.error('Error fetching widgets:', error);
          }
        );
      } else {
        console.error('User class not found.');
      }
    });
  }
  

  loadPaymentInfo(userId: string) {
    console.log(`Fetching payment information for user ID: ${userId}`);

    if (this.userClass) {
      this.paidService.getWidgetsByUserAndClass(userId, this.userClass).subscribe(
        (response: any[]) => {
          if (response && Array.isArray(response)) {
            console.log('Payment info loaded:', response);

            this.widgets = this.widgets.map((widget) => {
              const paymentInfo = response.find(
                (p) => p.widget_id === widget.idwidget
              );
              return {
                ...widget,
                paid: paymentInfo ? (paymentInfo.paid ? 'Ano' : 'Ne') : 'Ne',
                owe: paymentInfo ? (paymentInfo.owe ? 'Ano' : 'Ne') : 'Ne',
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
    } else {
      console.error('User class is undefined.');
    }
  }

  async openWidgetUsersModal(widgetId: number) {
    // Your existing code for opening the modal
  }
}