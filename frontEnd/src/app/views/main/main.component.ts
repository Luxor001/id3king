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
  filtroDate: Date[];
  filtersValue: FiltersValue = new FiltersValue();

  constructor(private routeService: RouteService) { }

  ngOnInit() {
    this.loading = true;
    var root = this;
    this.routeService.getAllRoutes()
      .subscribe(
      (routes: Array<Route>) => {
        this.routes = routes;
        this.filtersValue = root.getFilterValues(routes);
      },
      err => console.log(err)
      );

    UtilityService.resizeToParent($('.tableContainer'));
  }

  getFilterValues(routes: Route[]): FiltersValue {
    var root = this;
    var filtersValue = new FiltersValue();
    var dictionary;
    // Ottenimento dei possibili valori dei luoghi da visitare
    dictionary = routes.reduce((dictionary, route) => dictionary.add(route.luogo), new Set<string>());
    dictionary.forEach(place => filtersValue.places.push(new ConcreteSelectItem(place, place)));

    // Ottenimento dei possibili valori delle difficoltà degli itinerari
    dictionary = routes.reduce((dictionary, route) => dictionary.add(route.difficolta), new Set<string>());
    dictionary.forEach(difficulty => filtersValue.difficulties.push(new ConcreteSelectItem(difficulty, difficulty)));

    var sorted = routes.sort((a, b) => { return (a.id - b.id) });
    filtersValue.minDate = new Date(sorted[0].data);
    filtersValue.maxDate = new Date(sorted[sorted.length - 1].data);
    return filtersValue;
  }
}

class ConcreteSelectItem implements SelectItem {
  constructor(
    public value: string,
    public label: string) {
  }
}

class FiltersValue {
  places: SelectItem[] = [];
  difficulties: SelectItem[] = [];
  minDate: Date;
  maxDate: Date;
}
