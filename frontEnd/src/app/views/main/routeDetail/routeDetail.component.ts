import { Component, OnInit, Input } from '@angular/core';
import { Route } from '@shared/route.model';
import { RouteService } from '@shared/route.service';
import * as $ from 'jquery';

@Component({
  selector: 'route-detail',
  templateUrl: './routeDetail.component.html'
})

export class RouteDetail implements OnInit {
  @Input() routeSelezionato: Route;

  constructor(private routeService: RouteService) { }
  ngOnInit() {
    this.routeService.getRouteDetails(this.routeSelezionato.id)
      .subscribe(
      (info: any) => {
        // da inserire popolamento dettagli route
      },
      err => console.log(err)
      );
  }

  goToSite(route: Route): void {

  }

  saveBookmark(route: Route): void {

  }

  download(route: Route): void {

  }
}
