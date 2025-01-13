import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-user-action-modal',
  templateUrl: './user-action-modal.component.html',
  styleUrls: ['./user-action-modal.component.scss'],
})
export class UserActionModalComponent {
  @Input() userId!: string;
  @Input() widgetId!: string;
  @Input() email!: string; // Add this line
  paymentStatus: 'paid' | 'owe' | 'nic' | null = null;

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore
  ) {}

  dismissModal() {
    this.modalController.dismiss();
  }

  async applyChanges() {
    if (!this.paymentStatus) {
      return; // No action taken if no selection
    }

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
        .update({ paid, owe });

      console.log(
        `Updated user widget ${userWidgetId} with paid: ${paid}, owe: ${owe}`
      );
      this.dismissModal();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }
}
