import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WidgetsService } from '../services/widgets.service';
import { PaidService } from '../services/paid.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  userClass: string | undefined;
  userId: number = 1; // Replace this with actual logic to fetch the logged user's ID
  widgets: any[] = []; // Array to store widgets
  paidInfo: any = {}; // Object to store payment information

  constructor(
    private route: ActivatedRoute,
    private widgetsService: WidgetsService,
    private paidService: PaidService
  ) {}

  ngOnInit() {
    // Subscribe to route parameters
    this.route.paramMap.subscribe((params) => {
      const userClassParam = params.get('userClass');
      console.log('Class from route params:', userClassParam);

      if (userClassParam) {
        this.userClass = userClassParam;
        this.loadWidgetsAndPayments(this.userClass, this.userId);
      } else {
        console.error('No user class found in the route parameters.');
      }
    });
  }

  loadWidgetsAndPayments(userClass: string, userId: number) {
    console.log('Loading widgets and payment info for class:', userClass);

    // Fetch widgets for the class
    this.widgetsService.getWidgetsByClass(userClass).subscribe(
      (response) => {
        if (response && Array.isArray(response.widgets)) {
          this.widgets = response.widgets; // Store widgets
          console.log('Widgets loaded:', this.widgets);

          // Fetch payment information for the user
          this.loadPaymentInfo(userId, userClass);
        } else {
          console.error('Invalid widget response format:', response);
          this.widgets = []; // Reset widgets array if invalid
        }
      },
      (error) => {
        console.error('Error loading widgets:', error);
      }
    );
  }

  loadPaymentInfo(userId: number, userClass: string) {
    console.log('Fetching payment info for user:', userId);

    // Fetch payment information for the user
    this.paidService.getWidgetsByUserAndClass(userId, userClass).subscribe(
      (response) => {
        if (response && Array.isArray(response.widgets)) {
          // Map the payment information to a lookup object for quick access
          this.paidInfo = response.widgets.reduce((acc: any, widget: any) => {
            acc[widget.idwidget] = widget.paid === 'Ano' ? 'Ano' : 'Ne';
            return acc;
          }, {});
          console.log('Payment info loaded:', this.paidInfo);
        } else {
          console.error('Invalid payment response format:', response);
        }
      },
      (error) => {
        console.error('Error fetching payment info:', error);
      }
    );
  }

  // Helper method to get the payment status for a widget

}
