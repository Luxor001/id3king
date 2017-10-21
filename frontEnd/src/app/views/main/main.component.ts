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
  difficulties: SelectItem[] = [
    new DifficultySelectionItem('T', 'T'),
    new DifficultySelectionItem('E', 'E'),
    new DifficultySelectionItem('EE', 'EE'),
    new DifficultySelectionItem('EAI', 'EAI')
  ];

  constructor(private routeService: RouteService) { }

  ngOnInit() {
    this.loading = true;

    this.routeService.getAllRoutes()
      .subscribe(
      (routes: Array<Route>) => { this.routes = routes },
      err => console.log(err)
      );

    UtilityService.resizeToParent($('.tableContainer'));
  }
}

class DifficultySelectionItem implements SelectItem{
  constructor(
    public value: string,
    public label: string) {
  }
}
