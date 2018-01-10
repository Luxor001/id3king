/// Questo service a memorizzare la sessione utente corrente, fornendo anche alcune funzioni per la gestione della sessione nell'applicazione
import { Injectable } from '@angular/core';
import {RouteDetail} from './routeDetail.model'
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class SessionService {
  loginToken: string;
  userSession: UserSession;
  onSigninCallbacks: Function[];
  constructor() {
      this.onSigninCallbacks = [];
  }

  login(username: string, loginToken: string, savedRoutes: RouteDetail[], savedFilters: any[]) {
    this.userSession = new UserSession(username, loginToken, savedRoutes, savedFilters);
    this.onSigninCallbacks.forEach((func: Function) => func());
    return this.userSession;
  }

  logout(){
    this.userSession = null;
  }

  getSession(): UserSession {
    return this.userSession;
  }

  getLoginToken(): string {
    return this.userSession.loginToken;
  }

  addOnSigninCallback(callback: Function){
    this.onSigninCallbacks.push(callback);
  }
}

export class UserSession {
  constructor(public username: string,
    public loginToken: string,
    public savedRoutes: RouteDetail[],
    public savedFilters: any[]) { }
}
