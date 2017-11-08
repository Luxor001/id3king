import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AppConfig } from '../config/app.config'
import { UserLogin } from './userlogin.model'

@Injectable()
export class LoginService {
  private headers: HttpHeaders;
  private appBaseUrl: string;

  constructor(private http: HttpClient) {
    this.appBaseUrl = AppConfig.appBaseUrl;
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  signIn(userLogin: UserLogin): Observable<boolean> {
    return this.http.post(this.appBaseUrl + '/signin', { userLogin: userLogin });
  }

  signUp(userLogin: UserLogin): Observable<boolean> {
    return this.http.post(this.appBaseUrl + '/signup', { userLogin: userLogin });
  }
}
