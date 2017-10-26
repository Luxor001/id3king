import 'rxjs/add/operator/map'
import { Component, OnInit, ViewChild } from '@angular/core';
import { Route } from '../../shared/route.model';
import { RouteService } from '../../shared/route.service';
import { UtilityService } from '../../shared/utility.service';
import { SelectItem, DataTable } from 'primeng/primeng';
import * as $ from 'jquery';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html'
})

export class MainComponent implements OnInit {

  loading: boolean;
  routes: Route[];

  filtroDislivello: number;
  filtroLunghezza: number;
  filtroDurata: number;
  filtroDate: Date[];
  filtersValue: FiltersValue = new FiltersValue();

  constructor(private routeService: RouteService) { }

  @ViewChild('dataTableIstance') dt: DataTable;
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

    this.dt.filterConstraints['GreaterThan'] = function GreaterThan(value: number, filter: any): boolean {
      // thanks to https://stackoverflow.com/a/46370483/1306679

      // value = array of data from the current row
      // filter = value from the filter that will be searched in the value-array

      if (filter === undefined || filter === null) {
        return true;
      }

      if (value == null)
        return false;

      return value <= filter;
    }
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

  prova(hey: any): void {
    debugger;
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
