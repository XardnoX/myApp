import { LogLevel } from "@azure/msal-browser";
export const msalConfig = {
  auth: {
    clientId: "8117fe5b-a44f-42a2-89c3-f40bc9076356",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "msauth://io.ionic.com/5mCAxrHN2386pwqP%2FGQEY2lIvnw%3D", 
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
    secureCookies: true,
  },
  system: {
    allowRedirectInIframe: true,
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
          if (level === LogLevel.Error) {
              console.error(message);
          } else if (level === LogLevel.Info) {
              console.info(message);
          } else if (level === LogLevel.Verbose) {
              console.debug(message);
          } else if (level === LogLevel.Warning) {
              console.warn(message);
          }
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose,
  },
  },
  request: {
      prompt: "select_account"
  }
};
