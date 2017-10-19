import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {AppConfig} from '../config/app.config'

import {Route} from './route.model';
import {Observable} from 'rxjs/Observable';


@Injectable()
export class RouteService {
  private headers: HttpHeaders;
  private appBaseUrl: string;

  constructor(private http: HttpClient) {
    this.appBaseUrl = AppConfig.appBaseUrl;
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  getAllRoutes(): Observable<Route[]> {
    return this.http.get(this.appBaseUrl + '/getRoutes')
      .map(response => {
        return response;
      })
  }
}
