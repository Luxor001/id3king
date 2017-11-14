import {InjectionToken} from '@angular/core';

export let APP_CONFIG = new InjectionToken('app.config');

export const AppConfig = {
  appBaseUrl: 'http://localhost:8081/api'
};
