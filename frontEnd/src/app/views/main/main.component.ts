import { Component } from '@angular/core';
import 'rxjs/add/operator/map'
import { Route } from '../shared/route.model';
import {RouteService} from '../shared/route.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html'
})

export class MainComponent {
  routes: Route[];
  constructor(private routeService: RouteService) {

    this.routeService.getAllRoutes().subscribe((routes: Array<Route>) => {
      this.routes = routes;
    });
  }
}
