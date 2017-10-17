import 'rxjs/add/operator/map'
import { Component, OnInit } from '@angular/core';
import { Route } from '../shared/route.model';
import { RouteService } from '../shared/route.service';
import { DataTableModule, SharedModule } from 'primeng/primeng';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html'
})

export class MainComponent implements OnInit {

  loading: boolean;

  routes: Route[];

  cols: any[];

  constructor(private routeService: RouteService) { }

  ngOnInit() {
    this.loading = true;

    this.routeService.getAllRoutes()
      .subscribe(
      (routes: Array<Route>) => {this.routes = routes},
      err => console.log(err)
      );
  }
}
