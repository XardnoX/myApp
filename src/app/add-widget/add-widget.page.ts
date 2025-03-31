import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-add-widget',
  templateUrl: './add-widget.page.html',
  styleUrls: ['./add-widget.page.scss'],
})
export class AddWidgetPage {
  widgetName = '';
  widgetDescription = '';
  widgetPrice: number | null = null;
  startDate: string = '';
  endDate: string = '';
  userClass: string | undefined;
  isDarkMode = false;

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    public router: Router,
    private menuController: MenuController,  
    private themeService: ThemeService
  ) {}

  async ngOnInit() {
    this.isDarkMode = this.themeService.isDark();
    try {
      this.userClass = localStorage.getItem('userClass') ?? undefined;

      if (!this.userClass) {
        console.error('Třída uživatele nebyla nalezena v localStorage');
        return;
      }
    } catch (error) {
      console.error('Chyba:', error);
    }
  }
  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDark();
  }
  logout() {
    this.authService.logout();
  }

  toggleMenu() {
    this.menuController.toggle('add-widget-menu');
  }
  
  closeMenu() {
    this.menuController.close('add-widget-menu');
  }
  
  async createWidget() {
    try {
      const userClass = localStorage.getItem('userClass');
      if (!userClass) {
        throw new Error('třída uživatele nenalezena v localStorage.');
      }

      if (!this.widgetName || !this.widgetPrice || !this.endDate) {
        alert('Prosím vyplňte všechny požadované pole: název, cenu a datum ukončení.');
        return;
      }

      const formattedStart = this.startDate
        ? this.setTimeTo(this.startDate, 0, 1) 
        : this.setTimeTo(new Date().toISOString(), 0, 1); 
      const formattedEnd = this.setTimeTo(this.endDate, 23, 59);

      if (new Date(formattedEnd) <= new Date(formattedStart)) {
        alert('Datum ukončení musí být po datu začátku.');
        return;
      }

      const usersSnapshot = await this.firestore
        .collection('users', (ref) => ref.where('class', '==', userClass))
        .get()
        .toPromise();

      if (!usersSnapshot || usersSnapshot.empty) {
        throw new Error('Nebyl naležen žádny uživatel pro třídu');
      }

      const widgetDoc = await this.firestore.collection('widgets').add({
        name: this.widgetName,
        description: this.widgetDescription || '',
        price: this.widgetPrice,
        start: formattedStart,
        end: formattedEnd,
        class: userClass
      });

      console.log('Akce vytvořena s ID:', widgetDoc.id);

  
      const batch = this.firestore.firestore.batch();
      usersSnapshot.forEach((userDoc) => {
        const relationshipRef = this.firestore
          .collection('user_has_widgets')
          .doc().ref;

        batch.set(relationshipRef, {
          user_id: `/users/${userDoc.id}`,
          widget_id: `/widgets/${widgetDoc.id}`,
          paid: false,
          owe: false,
          belong: true
        });
      });

      await batch.commit();
      alert('akce a vztahy mezi uživateli a akcemi byly přidány úspěšně.');

      this.resetFormFields();
      this.router.navigate([`/notifications/${userClass}`]);

    } catch (error) {
      console.error('Chyba při vytváření akce.', error);
      alert('Chyba vytváření akce.');
    }
  }

  private setTimeTo(dateString: string, hours: number, minutes: number): string {
    const date = new Date(dateString);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  private resetFormFields() {
    this.widgetName = '';
    this.widgetDescription = '';
    this.widgetPrice = null;
    this.startDate = '';
    this.endDate = '';
  }
}


