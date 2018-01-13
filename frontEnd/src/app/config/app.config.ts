import {InjectionToken} from '@angular/core';

export let APP_CONFIG = new InjectionToken('app.config');

export const AppConfig = {
  // Da modificare in "https" se si vuole utilizzare TLS, insieme alla configurazione di chiave e certificato in "config.json".
  appBaseUrl: 'http://localhost:8081/api'
};
