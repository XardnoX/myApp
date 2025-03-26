import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeleteUsersPageRoutingModule } from './delete-users-routing.module';

import { DeleteUsersPage } from './delete-users.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeleteUsersPageRoutingModule
  ],
  declarations: [DeleteUsersPage]
})
export class DeleteUsersPageModule {}
