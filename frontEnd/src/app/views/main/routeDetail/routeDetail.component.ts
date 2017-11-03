import {Component, OnInit, Input} from '@angular/core';
import {Route} from '@shared/route.model';
import {RouteDetail} from '@shared/routedetail.model'
import {RouteService} from '@shared/route.service';
import {UtilityService} from '@shared/utility.service';
import * as $ from 'jquery';

@Component({
  selector: 'route-detail',
  templateUrl: './routeDetail.component.html'
})

export class RouteDetailComponent implements OnInit {
  @Input() routeSelezionato: Route;
  routeDetail: RouteDetail;

  constructor(private routeService: RouteService) {}
  ngOnInit() {
    this.routeService.getRouteDetails(this.routeSelezionato.id)
      .subscribe(
      (routeDetail: RouteDetail) => {
        this.routeDetail = routeDetail;
        this.routeDetail.data = new Date(this.routeDetail.data);
      },
      err => console.log(err));
  }

  goToSite(route: RouteDetail) {
    window.open(route.url, route.descrizione);
  }

  saveBookmark(route: RouteDetail) {
    this.routeService.saveRoute(route.id)
      .subscribe(
      (routeDetail: RouteDetail) => {
        this.routeDetail = routeDetail;
      },
      err => console.log(err));
  }

  downloadMap(route: RouteDetail) {
    UtilityService.downloadFile(route.mapUrl);
  }

  downloadTrack(route: RouteDetail) {
    UtilityService.downloadFile(route.trackUrl);
  }
}
