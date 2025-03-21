import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { WidgetUsersModalComponent } from './modals/widget-users-modal/widget-users-modal.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PaidService } from './services/paid.service';
import { WidgetsService } from './services/widgets.service';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { firebaseConfig } from '../environments/firebaseConfig';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserActionModalComponent } from './modals/user-action-modal/user-action-modal.component';
import { Papa } from 'ngx-papaparse';
import { AuthGuard } from './services/auth.guard';
import { AuthService } from './services/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    WidgetUsersModalComponent,
    UserActionModalComponent,
    
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    PaidService,
    WidgetsService,
    AuthGuard,
    Papa,
    AuthService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}