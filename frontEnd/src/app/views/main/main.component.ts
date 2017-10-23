import 'rxjs/add/operator/map'
import { Component, OnInit } from '@angular/core';
import { Route } from '../../shared/route.model';
import { RouteService } from '../../shared/route.service';
import { UtilityService } from '../../shared/utility.service';
import { SelectItem } from 'primeng/primeng';
import * as $ from 'jquery';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html'
})

export class MainComponent implements OnInit {

  loading: boolean;
  routes: Route[];

  filtroDislivello: number;
  difficulties: SelectItem[] = [];
  places: SelectItem[] = [];

  constructor(private routeService: RouteService) { }

  ngOnInit() {
    this.loading = true;
    var root = this;
    this.routeService.getAllRoutes()
      .subscribe(
      (routes: Array<Route>) => {
        this.routes = routes;
        root.getFilterValues(routes);
      },
      err => console.log(err)
      );

    UtilityService.resizeToParent($('.tableContainer'));
  }

  getFilterValues(routes: Route[]): void {
    var root = this;

    var dictionary;
    // Ottenimento dei possibili valori dei luoghi da visitare
    dictionary = routes.reduce((dictionary, rotta) => dictionary.add(rotta.luogo), new Set<string>());
    dictionary.forEach(place => this.places.push(new ConcreteSelectItem(place, place)));

    dictionary = routes.reduce((dictionary, rotta) => dictionary.add(rotta.difficolta), new Set<string>());
    dictionary.forEach(difficolta => this.difficulties.push(new ConcreteSelectItem(difficolta, difficolta)));
  }
}

class ConcreteSelectItem implements SelectItem {
  constructor(
    public value: string,
    public label: string) {
  }
}
