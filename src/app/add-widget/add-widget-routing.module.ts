import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddWidgetPage } from './add-widget.page';

const routes: Routes = [
  {
    path: '',
    component: AddWidgetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddWidgetPageRoutingModule {}
