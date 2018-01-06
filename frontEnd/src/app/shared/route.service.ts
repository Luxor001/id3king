import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AppConfig } from '../config/app.config'
import { SeasonsService } from './utility.service';

import { Route } from './route.model';
import { RouteDetail } from './routedetail.model'
import { Observable } from 'rxjs/Observable';
import { FilterValues } from '@shared/routefilter.model'


@Injectable()
export class RouteService {
  private headers: HttpHeaders;
  private appBaseUrl: string;
  private loading = true;

  constructor(private http: HttpClient) {
    this.appBaseUrl = AppConfig.appBaseUrl;
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  getAllRoutes(): Observable<any> {
    return this.http.get(this.appBaseUrl + '/getRoutes')
      .map((response: any) => {
        // aggiungi all'array di itinerari il periodo
        response.routes = response.routes.map(route => {
          route.lunghezza /= 1000;
          route.periodo = SeasonsService.getSeason(new Date(route.data));
          return route;
        });
        this.loading = false;
        return response;
      });
  }

  getRouteDetails(routeId: number): Observable<RouteDetail> {
    return this.http.post(this.appBaseUrl + '/getRouteDetails', { routeId: routeId })
    .map((response: any) => {
        response.route.lunghezza /= 1000;
        response.data = new Date(response.data);
        return response.route;
    });
  }

  getBookmarkedRoutes(loginToken: string): Observable<Route[]> {
    return this.http.post(this.appBaseUrl + '/getBookmarkedRoutes', { loginToken: loginToken });
  }

  saveRoute(routeId: number, loginToken: string): Observable<RouteDetail> {
    return this.http.post(this.appBaseUrl + '/saveRoute', { routeId: routeId, loginToken: loginToken });
  }

  saveFilter(filter: FilterValues, loginToken: string): Observable<RouteDetail> {
    return this.http.post(this.appBaseUrl + '/saveFilter', { filter: filter, loginToken: loginToken  });
  }

  getFilter(filterName: string, loginToken: string): Observable<any> {
    return this.http.post(this.appBaseUrl + '/getFilter', { filterName: filterName, loginToken: loginToken  });
  }
}
