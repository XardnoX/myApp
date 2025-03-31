import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ThemeService } from '../../services/theme.service';
import { PaidService } from '../../services/paid.service';

@Component({
  selector: 'app-user-action-modal',
  templateUrl: './user-action-modal.component.html',
  styleUrls: ['./user-action-modal.component.scss'],
})
export class UserActionModalComponent {
  @Input() userId!: string;
  @Input() widgetId!: string;
  @Input() email!: string;
  @Input() initialBelong: boolean = false;
  paymentStatus: 'paid' | 'owe' | 'nic' | null = null;
  isDarkMode = false;
  belong = false;
  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore,
    private themeService: ThemeService,
    private paidService: PaidService
  ) {}

  ngOnInit() {
    this.isDarkMode = this.themeService.isDark();
    this.firestore
      .collection('user_has_widgets')
      .doc(this.userId)
      .get()
      .subscribe(doc => {
        if (doc.exists) {
          const data = doc.data() as { belong?: boolean; paid?: boolean; owe?: boolean };
          this.belong = data?.belong ?? false;
          
          if (data?.paid === true) {
            this.paymentStatus = 'paid';
          } else if (data?.owe === true) {
            this.paymentStatus = 'owe';
          } else {
            this.paymentStatus = 'nic';
          }
        }
      });
  }
  
  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDark();
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  async applyChanges() {
    let paid = false;
    let owe = false;

    if (this.paymentStatus === 'paid') {
      paid = true;
      owe = false;
    } else if (this.paymentStatus === 'owe') {
      paid = false;
      owe = true;
    } else {
      paid = false;
      owe = false;
    }

    try {
      const userWidgetId = this.userId;
      await this.firestore
        .collection('user_has_widgets')
        .doc(userWidgetId)
        .update({ paid, owe, belong: this.belong });
        
      await this.paidService.checkAndSetFullPaid(this.widgetId);

      console.log(
        `Updated user widget ${userWidgetId} with paid: ${paid}, owe: ${owe}, belong: ${this.belong}`
      );
      this.modalController.dismiss();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }
}
