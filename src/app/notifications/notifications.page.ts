import { Component, OnInit } from '@angular/core';
import { ModalController, MenuController} from '@ionic/angular';
import { PaidService } from '../services/paid.service';
import { WidgetUsersModalComponent } from '../modals/widget-users-modal/widget-users-modal.component';
import { AuthService } from '../services/auth.service';
import { WidgetsService } from '../services/widgets.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { ThemeService } from '../services/theme.service';
interface UserWidgetData {
  paid: boolean;
  owe: boolean;
}
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  widgets: any[] = [];
  userClass: string | undefined;
  userId: string | null = null;
  isDarkMode = false;
  constructor(
    private modalController: ModalController,
    private paidService: PaidService,
    private authService: AuthService,
    private widgetsService: WidgetsService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private menuController: MenuController,
    private themeService: ThemeService
  ) {}

  async ngOnInit() {
    this.isDarkMode = this.themeService.isDark();
    try {
      this.userId = localStorage.getItem('userId');
      this.userClass = localStorage.getItem('userClass') ?? undefined;
  
      if (!this.userId) {
        console.error('User ID not found in localStorage.');
        return;
      }
  
      if (!this.userClass) {
        console.error('User class not found in localStorage.');
        return;
      }
  
      // Load widgets for the userClass
      this.loadWidgetsForClass(this.userClass);
    } catch (error) {
      console.error('Error initializing NotificationsPage:', error);
    }
  }
  
  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDark();
  }

  toggleMenu() {
    this.menuController.toggle('notifications-menu');
  }
  
  closeMenu() {
    this.menuController.close('notifications-menu');
  }

  loadWidgetsForClass(userClass: string) {
    this.paidService
      .getWidgetsByClass(userClass)
      .subscribe(
        async (allWidgets: any[]) => {
          console.log('Fetched Widgets:', allWidgets);
  
          for (const widget of allWidgets) {
            await this.paidService.checkAndSetFullPaidOnce(widget.id);
          }
  
          if (this.userId) {
            this.widgets = await this.mergeUserWidgetData(allWidgets);
            this.cdr.detectChanges();
            this.widgets.sort((a, b) => Number(a.paid) - Number(b.paid));
          }
        },
        (error) => {
          console.error('Error fetching widgets:', error);
        }
      );
    
  }
  
  

  async mergeUserWidgetData(widgets: any[]): Promise<any[]> {
    try {
      if (!this.userId) {
        console.warn('User ID is missing. Skipping merge.');
        return widgets.map((widget) => ({
          ...widget,
          paid: false,
          owe: false,
          progress: 0,
          progressColor: 'success',
          daysRemaining: 0,
        }));
      }
  
      const mergedWidgets = await Promise.all(
        widgets.map(async (widget) => {
          try {
            const widgetId = widget.id;
            const userWidgetData = await this.widgetsService.getUserWidgetData(this.userId!, widgetId);
  
            // Convert Firestore Timestamp to JavaScript Date
            const start = widget.start.toDate ? widget.start.toDate() : new Date(widget.start);
            const end = widget.end.toDate ? widget.end.toDate() : new Date(widget.end);
  
            const progress = this.getProgress(start, end);
            const progressColor = this.getProgressColor(start, end);
            const daysRemaining = this.getDaysRemaining(end);
  
            return {
              ...widget,
              paid: userWidgetData?.paid ?? false,
              owe: userWidgetData?.owe ?? false,
              start,
              end,
              progress,
              progressColor,
              daysRemaining,
            };
          } catch (error) {
            console.error(`Error fetching data for widget ID: ${widget.id}`, error);
            return {
              ...widget,
              paid: false,
              owe: false,
              progress: 0,
              progressColor: 'success',
              daysRemaining: 0,
            };
          }
        })
      );
  
      // Filter out widgets that are "over" and paid
      const filteredWidgets = mergedWidgets.filter((widget) => {
        const today = new Date();
        return !(today > widget.end && widget.paid);
      });
  
      return filteredWidgets;
    } catch (error) {
      console.error('Error in mergeUserWidgetData:', error);
      return widgets.map((widget) => ({
        ...widget,
        paid: false,
        owe: false,
        progress: 0,
        progressColor: 'success',
        daysRemaining: 0,
      }));
    }
  }
  
  async deleteWidget(widgetId: string) {
    try {
      // Confirm delete
      const confirmDelete = confirm('Opravdu chcete tento widget smazat?');
      if (!confirmDelete) return;
  
      // Delete the widget from the "widgets" collection
      await this.widgetsService.deleteWidget(widgetId);
  
      // Delete all relations for the widget in "user_has_widgets"
      await this.widgetsService.deleteWidgetRelations(widgetId);
  
      // Remove the widget from the UI
      this.widgets = this.widgets.filter((widget) => widget.id !== widgetId);
  
      console.log(`Widget ${widgetId} and its relations have been deleted.`);
    } catch (error) {
      console.error('Error deleting widget:', error);
    }
  }
  
  logout() {
    this.authService.logout();
  }
  async openWidgetUsersModal(widgetId: string) {
    const modal = await this.modalController.create({
      component: WidgetUsersModalComponent,
      componentProps: { widgetId },
    });
    return await modal.present();
  }

  getProgress(startDate: string, endDate: string): number {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const today = new Date().getTime();
  
    if (today < start) {
      return 0; // Not started yet
    } else if (today > end) {
      return 1; // Already ended
    }
  
    const totalDuration = end - start; // Total time between start and end
    const elapsed = today - start; // Time elapsed since start
    return elapsed / totalDuration; // Progress as a fraction
  }


  getProgressColor(startDate: string, endDate: string): string {
    const progress = this.getProgress(startDate, endDate);

    if (progress <= 0.9) {
      return progress < 0.5 ? 'success' : 'warning';
    } else {
      return 'danger';
    }
  }


  getDaysRemaining(endDate: string): number {
    const end = new Date(endDate).getTime();
    const today = new Date().getTime();
  
    if (today > end) {
      return 0; // Already ended
    }
  
    const msPerDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
    return Math.ceil((end - today) / msPerDay); // Days remaining
  }
}



