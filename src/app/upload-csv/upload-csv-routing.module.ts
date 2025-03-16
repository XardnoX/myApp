import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UploadCsvPage } from './upload-csv.page';

const routes: Routes = [
  {
    path: '',
    component: UploadCsvPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UploadCsvPageRoutingModule {}
