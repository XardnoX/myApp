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
     
      const confirmDelete = confirm('Opravdu chcete tento widget smazat?');
      if (!confirmDelete) return;
  
     
      await this.widgetsService.deleteWidget(widgetId);
  
    
      await this.widgetsService.deleteWidgetRelations(widgetId);
  
  
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
      return 0;
    } else if (today > end) {
      return 1; 
    }
  
    const totalDuration = end - start; 
    const elapsed = today - start; 
    return elapsed / totalDuration; 
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
      return 0;
    }
  
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.ceil((end - today) / msPerDay); 
  }
}



