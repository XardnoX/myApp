import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard'; // Import the new AuthGuard

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
  },
  {
    path: 'notifications/:userClass',
    loadChildren: () => import('./notifications/notifications.module').then(m => m.NotificationsPageModule),
    canActivate: [AuthGuard], // Replace MsalGuard with AuthGuard
  },
  {
    path: 'tables',
    loadChildren: () => import('./tables/tables.module').then(m => m.TablesPageModule),
  },
  {
    path: 'add-widget',
    loadChildren: () => import('./add-widget/add-widget.module').then(m => m.AddWidgetPageModule),
    canActivate: [AuthGuard], // Replace MsalGuard with AuthGuard
  },
  // Add other routes as needed
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}