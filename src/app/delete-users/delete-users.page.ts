import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-delete-users',
  templateUrl: './delete-users.page.html',
  styleUrls: ['./delete-users.page.scss'],
})
export class DeleteUsersPage implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  userSearchQuery: string = '';
  selectedUsers: Set<string> = new Set<string>();
  classes: string[] = [];
  filteredClasses: string[] = [];
  classSearchQuery: string = '';
  selectedClasses: Set<string> = new Set<string>();
  isDarkMode = false;
  userClass: string | undefined;
  userId: string | null = null;

  constructor(
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private authService: AuthService,
    public router: Router,
    private themeService: ThemeService,
    private menuController: MenuController,
  ) {}

  ngOnInit() {
    this.isDarkMode = this.themeService.isDark();
    try {
      this.userId = localStorage.getItem('userId');
      this.userClass = localStorage.getItem('userClass') ?? undefined;

      if (!this.userId) {
        console.error('User ID nebylo nalezeno v localStorage');
        return;
      }

      if (!this.userClass) {
        console.error('User class nebyla nalezena v localStorage');
        return;
      }

    } catch (error) {
      console.error('Nastala chyba', error);
    }
    this.loadUsers();
    this.loadClasses();
    
  }

  toggleMenu() {
    this.menuController.toggle('delete-users-menu');
  }

  closeMenu() {
    this.menuController.close('delete-users-menu');
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDark();
  }

  logout() {
    this.authService.logout();
  }
  
  loadUsers() {
    this.firestore
      .collection('users')
      .valueChanges({ idField: 'id' })
      .subscribe((users: any[]) => {
        this.users = users;
        this.filteredUsers = users;
      }, (error) => {
        console.error('Chyba při načítání uživatelů:', error);
      });
  }

  filterUsers() {
    const query = this.userSearchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.email.toLowerCase().includes(query)
    );
  }

  toggleUserSelection(userId: string) {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  async deleteSelectedUsers() {
    if (this.selectedUsers.size === 0) {
      this.showAlert('Chyba', 'Vyberte alespoň jednoho uživatele k odstranění.');
      return;
    }

    const confirm = await this.showConfirm('Potvrzení', 'Opravdu chcete smazat vybrané uživatele?');
    if (!confirm) return;

    try {
      const batch = this.firestore.firestore.batch();

      for (const userId of this.selectedUsers) {
        const userRef = this.firestore.collection('users').doc(userId).ref;
        batch.delete(userRef);

        const roleHasUserQuery = this.firestore.collection('role_has_user', ref =>
          ref.where('user_id', '==', `/users/${userId}`)
        );
        const roleHasUserSnapshot = await roleHasUserQuery.get().toPromise();
        roleHasUserSnapshot?.forEach(doc => {
          batch.delete(doc.ref);
        });

        const userHasWidgetsQuery = this.firestore.collection('user_has_widgets', ref =>
          ref.where('user_id', '==', `/users/${userId}`)
        );
        const userHasWidgetsSnapshot = await userHasWidgetsQuery.get().toPromise();
        userHasWidgetsSnapshot?.forEach(doc => {
          batch.delete(doc.ref);
        });
      }

      await batch.commit();
      this.selectedUsers.clear();
      this.showAlert('ÚspěŠné smazání', 'Vybraní uživatelé byli úspěšně smazáni.');
    } catch (error) {
      console.error('Chyba při mazání uživatelů:', error);
      this.showAlert('Chyba', 'Nepodařilo se smazat uživatele: ' + error);
    }
  }

  loadClasses() {
    this.firestore
      .collection('notifications')
      .valueChanges()
      .subscribe((notifications: any[]) => {
        const classSet = new Set<string>(notifications.map(n => n.class));
        this.classes = Array.from(classSet);
        this.filteredClasses = this.classes;
      }, (error) => {
        console.error('Chyba při načítání tříd:', error);
      });
  }

  filterClasses() {
    const query = this.classSearchQuery.toLowerCase();
    this.filteredClasses = this.classes.filter(cls =>
      cls.toLowerCase().includes(query)
    );
  }

toggleClassSelection(className: string) {
    if (this.selectedClasses.has(className)) {
      this.selectedClasses.delete(className);
    } else {
      this.selectedClasses.add(className);
    }
  }

  async deleteSelectedClasses() {
    if (this.selectedClasses.size === 0) {
      this.showAlert('Chyba', 'Vyberte alespoň jednu třídu k odstranění.');
      return;
    }

    const confirm = await this.showConfirm('Potvrzení', `Opravdu chcete smazat vybrané třídy (${Array.from(this.selectedClasses).join(', ')}) a všechny související údaje?`);
    if (!confirm) return;

    try {
      const batch = this.firestore.firestore.batch();
      const userIdsToDelete: string[] = [];

      for (const selectedClass of this.selectedClasses) {
        const notificationsQuery = this.firestore.collection('notifications', ref =>
          ref.where('class', '==', selectedClass)
        );
        const notificationsSnapshot = await notificationsQuery.get().toPromise();
        notificationsSnapshot?.forEach(doc => {
          batch.delete(doc.ref);
        });
        const widgetsQuery = this.firestore.collection('widgets', ref =>
          ref.where('class', '==', selectedClass)
        );
        const widgetsSnapshot = await widgetsQuery.get().toPromise();
        widgetsSnapshot?.forEach(doc => {
          batch.delete(doc.ref);
        });
        const usersQuery = this.firestore.collection('users', ref =>
          ref.where('class', '==', selectedClass)
        );
        const usersSnapshot = await usersQuery.get().toPromise();
        usersSnapshot?.forEach(doc => {
          userIdsToDelete.push(doc.id);
          batch.delete(doc.ref);
        });
      }
      for (const userId of userIdsToDelete) {
        const userHasWidgetsQuery = this.firestore.collection('user_has_widgets', ref =>
          ref.where('user_id', '==', `/users/${userId}`)
        );
        const userHasWidgetsSnapshot = await userHasWidgetsQuery.get().toPromise();
        userHasWidgetsSnapshot?.forEach(doc => {
          batch.delete(doc.ref);
        });

        const roleHasUserQuery = this.firestore.collection('role_has_user', ref =>
          ref.where('user_id', '==', `/users/${userId}`)
        );
        const roleHasUserSnapshot = await roleHasUserQuery.get().toPromise();
        roleHasUserSnapshot?.forEach(doc => {
          batch.delete(doc.ref);
        });
      }

      await batch.commit();
      this.selectedClasses.clear();
      this.showAlert('Úspěch', `Vybrané třídy (${Array.from(this.selectedClasses).join(', ')}) a všechny související údaje byly úspěšně smazány.`);
    } catch (error) {
      console.error('Chyba při mazání tříd:', error);
      this.showAlert('Chyba', 'Nepodařilo se smazat třídy: ' + error);
    }
  }
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async showConfirm(header: string, message: string): Promise<boolean> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'Zrušit',
          role: 'cancel',
          handler: () => false,
        },
        {
          text: 'Potvrdit',
          handler: () => true,
        },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role !== 'cancel';
  }
}