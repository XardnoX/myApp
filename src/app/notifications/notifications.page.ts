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
  userClass: string | undefined; // Holds the user class fetched from the route
  userId: number | null = null; // Holds the logged-in user's ID (fetched dynamically)
  widgets: any[] = []; // Array to store widgets with payment information

  constructor(
    private route: ActivatedRoute,
    private widgetsService: WidgetsService,
    private paidService: PaidService
  ) {}

  ngOnInit() {
    // Fetch the userId from session and the userClass from the route
    this.fetchUserIdAndLoadWidgets();
  }

  // Fetch the userId from session and load widgets
  fetchUserIdAndLoadWidgets() {
    // Simulating userId fetch; replace with actual logic to fetch from backend or session
    this.userId = 1; // Example userId; replace with real fetch
    console.log('Fetched userId:', this.userId);

    // Fetch the userClass from route parameters
    this.route.paramMap.subscribe((params) => {
      const userClassParam = params.get('userClass');
      if (userClassParam) {
        this.userClass = userClassParam;
        console.log('Class from route params:', this.userClass);

        // Load widgets and payment information
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

  // Load widgets for the same class and payment information
  loadWidgetsAndPayments(userClass: string, userId: number) {
    console.log(`Loading widgets for class "${userClass}" and payment info for user ID: ${userId}`);

    // Fetch widgets belonging to the same class
    this.widgetsService.getWidgetsByClass(userClass).subscribe(
      (response) => {
        if (response && Array.isArray(response.widgets)) {
          console.log('Widgets loaded from service:', response.widgets);

          // Initialize widgets array
          this.widgets = response.widgets;

          // Fetch payment information for each widget
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

  // Fetch payment information for the widgets
  loadPaymentInfo(userId: number) {
    console.log(`Fetching payment information for user ID: ${userId}`);

    this.paidService.getWidgetsByUserAndClass(userId).subscribe(
      (response) => {
        if (response && Array.isArray(response.widgets)) {
          console.log('Payment info loaded:', response.widgets);

          // Map the payment information to the corresponding widgets
          this.widgets = this.widgets.map((widget) => {
            const paymentInfo = response.widgets.find(
              (p: { widget_id: any; }) => p.widget_id === widget.idwidget
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
}
