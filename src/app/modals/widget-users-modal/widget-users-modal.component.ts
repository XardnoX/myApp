import { Component, Input, OnInit } from '@angular/core';
import { PaidService } from '../../services/paid.service';
import { ModalController } from '@ionic/angular';
 
@Component({
  selector: 'app-widget-users-modal',
  templateUrl: './widget-users-modal.component.html',
  styleUrls: ['./widget-users-modal.component.scss'],
})
export class WidgetUsersModalComponent implements OnInit {
  @Input() widgetId: number | null = null; // získání widgetid
  users: any[] = []; // Pole pro ukložení uživatelů

  constructor(
    private paidService: PaidService,
    private modalController: ModalController  
  ) {}

  loadUsersForWidget(widgetId: number) {
    this.paidService.getUsersByWidget(widgetId).subscribe(
      (response: { users: any[] }) => {
        if (response && Array.isArray(response.users)) {
          this.users = response.users;
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
