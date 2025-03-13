import { Injectable } from '@angular/core';
import { PublicClientApplication, IPublicClientApplication } from '@azure/msal-browser'; // Import IPublicClientApplication
import { msalConfig } from '../../msal.config';

@Injectable({
  providedIn: 'root',
})
export class MsalInitializationService {
  private msalInstance: IPublicClientApplication; // Use interface type

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig); // Initialize with concrete class
  }

  async initialize(): Promise<void> {
    try {
      await this.msalInstance.initialize();
      console.log('MSAL initialized in MsalInitializationService');
      const response = await this.msalInstance.handleRedirectPromise();
      if (response) {
        console.log('Redirect handled in MsalInitializationService:', response);
        this.msalInstance.setActiveAccount(response.account);
      } else {
        console.log('No redirect response to handle in MsalInitializationService');
      }
    } catch (error) {
      console.error('Error initializing MSAL or handling redirect:', error);
    }
  }

  getMsalInstance(): IPublicClientApplication { // Return IPublicClientApplication
    return this.msalInstance;
  }
}