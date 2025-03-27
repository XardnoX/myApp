import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MenuController, ModalController } from '@ionic/angular';
import { Papa } from 'ngx-papaparse';
import { WidgetUsersModalComponent } from '../modals/widget-users-modal/widget-users-modal.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-upload-csv',
  templateUrl: './upload-csv.page.html',
  styleUrls: ['./upload-csv.page.scss'],
})
export class UploadCsvPage implements OnInit {
  selectedFile: File | null = null;
  uploadMessage: string | null = null;
  uploadMessageType: string = 'primary';
  userFormat: string = 'type, class, email, role, first_name, last_name (user, 2021B, novak_filip@oauh.cz, admin, Filip, Novák)';
  notificationFormat: string = 'type, class (notification, 2021B)';
  private roleMap: { [key: string]: string } = {};
  userClass: string | undefined;
  userId: string | null = null;
  authService: AuthService;
  modalController: ModalController;
  isDarkMode = false;

  constructor(
    private firestore: AngularFirestore,
    private papa: Papa,
    private menuController: MenuController,
    public router: Router,
    authService: AuthService,
    modalController: ModalController,
    private themeService: ThemeService
  ) {
    this.authService = authService;
    this.modalController = modalController;
  }

  async ngOnInit() {
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

      await this.loadRoles();
    } catch (error) {
      console.error('Chyba při vkládání souboru:', error);
    }
  }

  toggleMenu() {
    this.menuController.toggle('upload-menu');
  }

  closeMenu() {
    this.menuController.close('upload-menu');
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDark();
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

  async loadRoles() {
    try {
      const roleSnapshot = await this.firestore.collection('roles').get().toPromise();
      if (roleSnapshot) {
        roleSnapshot.forEach(doc => {
          const roleName = doc.get('name') as string;
          this.roleMap[roleName] = `/${doc.ref.path}`;
        });
      }
    } catch (error) {
      console.error('Chyba při načítení rolí:', error);
      this.uploadMessage = 'Chyba při načítání rolí: ' + error;
      this.uploadMessageType = 'danger';
    }
  }

  onFileSelected(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.selectedFile = event.target.files[0];
    this.uploadMessage = null;
  }

  async uploadCsv() {
    if (!this.selectedFile) {
      this.uploadMessage = 'Vyberte prosím CSV soubor.';
      this.uploadMessageType = 'danger';
      return;
    }

    try {
      const csvData = await this.readFile(this.selectedFile);
      const parsedData = await this.parseCsv(csvData);
      await this.processData(parsedData);
      this.uploadMessage = 'Data byla úspěšně nahrána';
      this.uploadMessageType = 'success';
      this.selectedFile = null;
    } catch (error) {
      this.uploadMessage = 'Chyba při nahrávání dat: ' + error;
      this.uploadMessageType = 'danger';
    }
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  private parseCsv(data: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.papa.parse(data, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.errors.length > 0) {
            reject(result.errors);
          } else {
            resolve(result.data);
          }
        },
        error: (error) => reject(error),
      });
    });
  }

  private async processData(data: any[]) {
    const usersBatch = this.firestore.firestore.batch();
    const roleHasUserBatch = this.firestore.firestore.batch();
    const notificationsBatch = this.firestore.firestore.batch();

    for (const row of data) {
      if (row.type === 'user') {
        if (!row.class || !row.email) {
          throw new Error('Chybí povinné pole class nebo email v řádku: ' + JSON.stringify(row));
        }

        const userData = {
          class: row.class,
          email: row.email,
          role: row.role || 'user', 
          first_name: row.first_name,
          last_name: row.last_name,
          credit: 0,
        };

        const userRef = this.firestore.collection('users').doc().ref;
        usersBatch.set(userRef, userData);

        let roleName = userData.role.toLowerCase();
        if (!['user', 'admin', 'classteacher', 'classcasher'].includes(roleName)) {
          roleName = 'user';
        }

        const roleId = this.roleMap[roleName];
        if (!roleId) {
          throw new Error(`Role "${roleName}" nebyla nalezena v databázi`);
        }

        const roleHasUserRef = this.firestore.collection('role_has_user').doc().ref;
        roleHasUserBatch.set(roleHasUserRef, {
          user_id: `/${userRef.path}`,
          role_id: roleId,
        });
      } else if (row.type === 'notification') {
        if (!row.class) {
          throw new Error('Chybí povinné pole class v řádku: ' + JSON.stringify(row));
        }

        const notificationData = {
          class: row.class,
        };

        const notificationRef = this.firestore.collection('notifications').doc().ref;
        notificationsBatch.set(notificationRef, notificationData);
      } else {
        throw new Error('Neznámý typ záznamu: ' + row.type);
      }
    }

    await usersBatch.commit();
    await roleHasUserBatch.commit();
    await notificationsBatch.commit();
  }
}