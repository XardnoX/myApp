import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'notifications/:userClass',
    loadChildren: () => import('./notifications/notifications.module').then(m => m.NotificationsPageModule),
    canActivate: [MsalGuard],
  },
  {
    path: 'tables',
    loadChildren: () => import('./tables/tables.module').then( m => m.TablesPageModule)
  },
  {
    path: 'add-widget',
    loadChildren: () => import('./add-widget/add-widget.module').then( m => m.AddWidgetPageModule),
    canActivate: [MsalGuard],
  },

  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
