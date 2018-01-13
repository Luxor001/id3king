import { Component, OnInit, Input } from '@angular/core';
import { Route } from '@shared/route.model';
import { RouteDetail } from '@shared/routedetail.model'
import { RouteService } from '@shared/route.service';
import { UtilityService } from '@shared/utility.service';
import { SessionService, UserSession } from '@shared/session.service';
import * as $ from 'jquery';

@Component({
  selector: 'route-detail',
  templateUrl: './routeDetail.component.html'
})

export class RouteDetailComponent implements OnInit {
  @Input() routeSelezionato: Route;
  routeDetail: RouteDetail;

  constructor(private routeService: RouteService,
    public sessionService: SessionService) { }

  ngOnInit() {
    this.routeService.getRouteDetails(this.routeSelezionato.id)
      .subscribe(
      (routeDetail: RouteDetail) => {
        this.routeDetail = routeDetail;
      },
      err => console.log(err));
  }

  goToSite(route: RouteDetail) {
    window.open(route.url, route.descrizione);
  }

  saveBookmark(routeParam: RouteDetail) {
    let route = routeParam;
    let session = this.sessionService.getSession();
    if (!session)
      return;
    this.routeService.saveRoute(route.id, session.loginToken)
      .subscribe(
      (result: any) => {
        if (result.saved)
          this.sessionService.getSession().savedRoutes.push(route);
        else
          this.sessionService.getSession().savedRoutes.splice(this.sessionService.getSession().savedRoutes.indexOf(route), 1);
      },
      err => console.log(err));
  }

  downloadMap(route: RouteDetail) {
    UtilityService.downloadFile(route.mapUrl);
  }

  downloadTrack(route: RouteDetail) {
    UtilityService.downloadFile(route.trackUrl);
  }

  isBookmarked(routeParam: RouteDetail) {
    if (this.sessionService.getSession() == null || routeParam == null)
      return false;
    let route = routeParam;
    let foundRoute = this.sessionService.getSession().savedRoutes.find(currRoute => currRoute.id == route.id);
    return foundRoute != null;
  }
}
