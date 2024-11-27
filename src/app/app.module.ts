import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { WidgetUsersModalComponent } from './modals/widget-users-modal/widget-users-modal.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PaidService } from './services/paid.service';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { firebaseConfig } from '../environments/firebaseConfig';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent, 
    WidgetUsersModalComponent, 
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),  
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),  
    AngularFireAuthModule,
    HttpClientModule,  
    CommonModule,  
    FormsModule,  
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    PaidService,  
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
