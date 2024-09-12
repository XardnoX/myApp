import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  userClass: string | undefined;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    // Retrieve the user class from the route parameters
    this.route.paramMap.subscribe(params => {
      const userClassParam = params.get('userClass');
      if (userClassParam) {
        this.userClass = userClassParam;
        // You can now load notifications specific to the user's class
        this.loadNotificationsForClass(this.userClass);
      } else {
        console.error('No user class found in the route parameters.');
      }
    });
  }

  loadNotificationsForClass(userClass: string) {
    // Implement your logic here to load class-specific notifications
    console.log('Loading notifications for class:', userClass);
    // Example: Call a service to fetch notifications based on class
    // this.notificationsService.getNotificationsByClass(userClass).subscribe(...);
  }
}
