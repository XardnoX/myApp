import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UploadCsvPageRoutingModule } from './upload-csv-routing.module';

import { UploadCsvPage } from './upload-csv.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UploadCsvPageRoutingModule
  ],
  declarations: [UploadCsvPage]
})
export class UploadCsvPageModule {}
