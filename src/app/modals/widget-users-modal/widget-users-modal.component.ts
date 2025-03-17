import { Component, Input, OnInit } from '@angular/core';
import { PaidService } from '../../services/paid.service';
import { ModalController } from '@ionic/angular';
import { UserActionModalComponent } from '../user-action-modal/user-action-modal.component';
import { ThemeService } from '../../services/theme.service';
@Component({
  selector: 'app-widget-users-modal',
  templateUrl: './widget-users-modal.component.html',
  styleUrls: ['./widget-users-modal.component.scss'],
})
export class WidgetUsersModalComponent implements OnInit {
  @Input() widgetId: string | null = null;
  users: any[] = [];
  isDarkMode = false;
  constructor(private paidService: PaidService, private modalController: ModalController, private themeService: ThemeService) {}
  
  
    ngOnInit() {
      if (this.widgetId) {
        this.loadUsersForWidget(this.widgetId);
        this.isDarkMode = this.themeService.isDark();
      }
    }

  
  loadUsersForWidget(widgetId: string) {
    this.paidService.getUsersForWidget(widgetId).subscribe(
      (users) => {
        this.users = users;
      },
      (error) => {
        console.error('Chyba při spojování uživatelů a akcí', error);
      }
    );
  }

  async openUserActionModal(user: any) {
    const modal = await this.modalController.create({
      component: UserActionModalComponent,
      componentProps: {
        userId: user.id,
        widgetId: this.widgetId,
        email: user.email,
      },
    });

    return await modal.present();
  }
  
  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDark();
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}
