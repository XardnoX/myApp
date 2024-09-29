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
  widgets: any[] = [];  // Array to store widgets for the class

  constructor(private route: ActivatedRoute, private widgetsService: WidgetsService) { }
  
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const userClassParam = params.get('userClass');
      console.log('Class from route params:', userClassParam); // Log to check value
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
    this.widgetsService.getWidgetsByClass(userClass).subscribe((widgets) => {
      this.widgets = widgets; // Store fetched widgets
      console.log('Widgets loaded:', this.widgets);
    }, (error) => {
      console.error('Error loading widgets:', error);
    });
  }
  

}
