import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WidgetsService } from '../services/widgets.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  userClass: string | undefined;
  widgets: any[] = []; // Ensure this is always an array

  constructor(
    private route: ActivatedRoute,
    private widgetsService: WidgetsService
  ) {}

  ngOnInit() {
    // Subscribe to route parameters
    this.route.paramMap.subscribe((params) => {
      const userClassParam = params.get('userClass');
      console.log('Class from route params:', userClassParam);

      if (userClassParam) {
        this.userClass = userClassParam;
        this.loadWidgetsForClass(this.userClass);
      } else {
        console.error('No user class found in the route parameters.');
      }
    });
  }

  loadWidgetsForClass(userClass: string) {
    console.log('Loading widgets for class:', userClass);

    // Call the service to fetch widgets by class
    this.widgetsService.getWidgetsByClass(userClass).subscribe(
      (response) => {
        // Validate response and ensure widgets are stored as an array
        if (response && Array.isArray(response.widgets)) {
          this.widgets = response.widgets; // Store the widgets array
          console.log('Widgets loaded:', this.widgets);
        } else {
          console.error('Invalid response format:', response);
          this.widgets = []; // Reset widgets array if response is invalid
        }
      },
      (error) => {
        console.error('Error loading widgets:', error);
      }
    );
  }
}
