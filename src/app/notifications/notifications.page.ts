import { Component, OnInit } from '@angular/core';
import { ModalController, MenuController } from '@ionic/angular';
import { PaidService } from '../services/paid.service';
import { WidgetUsersModalComponent } from '../modals/widget-users-modal/widget-users-modal.component';
import { AuthService } from '../services/auth.service';
import { WidgetsService } from '../services/widgets.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { ThemeService } from '../services/theme.service';

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
  ) {
  }

  async ngOnInit() {
    this.isDarkMode = this.themeService.isDark();
    try {
      this.userId = localStorage.getItem('userId');
      this.userClass = localStorage.getItem('userClass') ?? undefined;

      console.log('User ID:', this.userId);
      console.log('User Class:', this.userClass);

      if (!this.userId) {
        console.error('User ID nebylo nalezeno v localStorage.');
        this.router.navigate(['/home']);
        return;
      }

      if (!this.userClass) {
        console.error('User class nebyla nalezena v localStorage.');
        this.router.navigate(['/home']);
        return;
      }

      await this.loadWidgetsForClass(this.userClass);
    } catch (error) {
      this.router.navigate(['/home']);
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

  async loadWidgetsForClass(userClass: string) {
    this.paidService
      .getWidgetsByClass(userClass)
      .subscribe(
        async (allWidgets: any[]) => {
          console.log('Widgets fetched:', allWidgets);

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
          console.error('Chyba při načítání akcí', error);
        }
      );
  }

  async mergeUserWidgetData(widgets: any[]): Promise<any[]> {
    try {
      if (!this.userId) {
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
      const confirmDelete = confirm('Opravdu chcete tuhle akci smazat?');
      if (!confirmDelete) return;

      await this.widgetsService.deleteWidget(widgetId);
      await this.widgetsService.deleteWidgetRelations(widgetId);

      this.widgets = this.widgets.filter((widget) => widget.id !== widgetId);
      console.log(`Akce ${widgetId} a relace spojené s ní byly smazány.`);
    } catch (error) {
      console.error('při mazání akce došlo k chybě:', error);
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
    await modal.present();
    console.log('WidgetUsersModal presented');
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