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

// ✅ Import MSAL (Microsoft Authentication)
import { MsalModule, MsalService, MsalGuard, MsalBroadcastService, MSAL_INSTANCE, MSAL_GUARD_CONFIG, MsalRedirectComponent } from '@azure/msal-angular';
import { PublicClientApplication, InteractionType, BrowserCacheLocation } from '@azure/msal-browser';
import { msalConfig } from 'src/msal.config';
import { CustomNavigationClient } from 'src/app/services/customNavigationClient';
import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';

// ✅ Import Cordova InAppBrowser
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

// ✅ MSAL Instance Provider
export function MSALInstanceFactory() {
  const msalInstance = new PublicClientApplication(msalConfig);
  msalInstance.setNavigationClient(new CustomNavigationClient(new InAppBrowser()));
  return msalInstance;
}

// ✅ MSAL Guard Config
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['User.Read'],
    },
  };
}

// ✅ MSAL Interceptor Config (Optional)
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map([
      ['https://graph.microsoft.com/v1.0/me', ['User.Read']],
    ]),
  };
}

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
    MsalModule.forRoot(
      MSALInstanceFactory(),
      MSALGuardConfigFactory(),
      MSALInterceptorConfigFactory()
    ),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    PaidService,
    WidgetsService,
    { provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory },
    { provide: MSAL_GUARD_CONFIG, useFactory: MSALGuardConfigFactory },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    InAppBrowser
  ],
  bootstrap: [AppComponent, MsalRedirectComponent],
})
export class AppModule {}
