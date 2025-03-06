export const msalConfig = {
  auth: {
    clientId: "8117fe5b-a44f-42a2-89c3-f40bc9076356",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "msauth://io.ionic.com/2jmj7l5rSw0yVb/vlWAYkK/YBwk=", 
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  },
  system: {
    allowRedirectInIframe: true,
  },
  request: {
      prompt: "select_account"
  }
};
