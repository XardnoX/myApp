import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeleteUsersPage } from './delete-users.page';

const routes: Routes = [
  {
    path: '',
    component: DeleteUsersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeleteUsersPageRoutingModule {}
