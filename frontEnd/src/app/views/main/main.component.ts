import 'rxjs/add/operator/map'
import { Component, OnInit, ViewChild } from '@angular/core';
import { Route } from '@shared/route.model';
import { RouteService } from '@shared/route.service';
import { UtilityService } from '@shared/utility.service';
import { SelectItem, DataTable } from 'primeng/primeng';
import * as $ from 'jquery';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html'
})

export class MainComponent implements OnInit {

  routes: Route[];

  filtroDislivello: number;
  filtroLunghezza: number;
  filtroDurata: number;
  filtroDate: Date[];
  filtersValue: FiltersValue = new FiltersValue();

  constructor(private routeService: RouteService) { }

  @ViewChild('dataTableIstance') dt: DataTable;
  ngOnInit() {
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

    // thanks to https://stackoverflow.com/a/46370483/1306679
    this.dt.filterConstraints['atMost'] = function atMost(value: number, filter: any): boolean {
      if (filter === undefined || filter === null)
        return true;
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

    // Possibili valori delle difficoltà degli itinerari
    dictionary = routes.reduce((dictionary, route) => dictionary.add(route.difficolta), new Set<string>());
    dictionary.forEach(difficulty => filtersValue.difficulties.push(new ConcreteSelectItem(difficulty, difficulty)));

    filtersValue.periods = [
      new ConcreteSelectItem('Inverno', 'Inverno'),
      new ConcreteSelectItem('Primavera', 'Primavera'),
      new ConcreteSelectItem('Estate', 'Estate'),
      new ConcreteSelectItem('Autunno', 'Autunno')
    ];
    // Data minima e massima
    var sorted = routes.sort((a, b) => { return (a.id - b.id) });
    filtersValue.minDate = new Date(sorted[0].data);
    filtersValue.maxDate = new Date(sorted[sorted.length - 1].data);

    // Bounds di lunghezza
    sorted = routes.sort((a, b) => { return (a.lunghezza - b.lunghezza) });
    filtersValue.minRouteLength = sorted[0].lunghezza;
    filtersValue.maxRouteLength = sorted[sorted.length - 1].lunghezza

    // Bounds di durata
    sorted = routes.sort((a, b) => { return (a.durata - b.durata) });
    filtersValue.minDuration = sorted[0].durata;
    filtersValue.maxDuration = sorted[sorted.length - 1].durata
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
  periods: SelectItem[] = [];
  maxRouteLength: number;
  minRouteLength: number;
  minDuration: number;
  maxDuration: number;
  minDate: Date;
  maxDate: Date;
}
