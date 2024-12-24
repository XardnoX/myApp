import { Component, Input, OnInit } from '@angular/core';
import { PaidService } from '../../services/paid.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-widget-users-modal',
  templateUrl: './widget-users-modal.component.html',
  styleUrls: ['./widget-users-modal.component.scss'],
})
export class WidgetUsersModalComponent implements OnInit {
  @Input() widgetId: string | null = null; // The ID of the widget
  users: any[] = []; // Array to store user payment information

  constructor(
    private paidService: PaidService,
    private modalController: ModalController
  ) {}

  loadUsersForWidget(widgetId: string) {
    this.paidService.getUsersByWidget(widgetId).subscribe(
      (response: any[]) => {
        if (response && Array.isArray(response)) {
          this.users = response;
        }
      },
      (error: any) => {
        console.error('Error fetching users for widget:', error);
      }
    );
  }

  ngOnInit() {
    if (this.widgetId) {
      this.loadUsersForWidget(this.widgetId);
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}
