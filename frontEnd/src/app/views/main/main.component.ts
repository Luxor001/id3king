import 'rxjs/add/operator/map'
import { Component, OnInit, ViewChild } from '@angular/core';
import { Route } from '@shared/route.model';
import { RouteService } from '@shared/route.service';
import { UtilityService } from '@shared/utility.service';
import { LoginService } from '@shared/login.service';
import { SelectItem, DataTable } from 'primeng/primeng';
import { SessionService, UserSession } from '@shared/session.service';
import { FilterBounds, Filter } from '@shared/routefilter.model'
import * as $ from 'jquery';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html'
})

export class MainComponent implements OnInit {

  allRoutes: Route[];
  routes: Route[];

  private defaultBookmarkedFilter = new ConcreteSelectItem({}, 'Salva come nuovo gruppo filtri');
  bookmarkedFilters: ConcreteSelectItem[];
  bookmarkedFilterSelected: string;
  bookmarkedFilterModal = false;

  bookmarkedRoutes: boolean;

  filterValues = new Filter();
  filterBounds = new FilterBounds();
  erroreCorrenteFilters: string;
  tableMessage = "Caricamento itinerari in corso...";

  constructor(private routeService: RouteService,
    private loginService: LoginService,
    public sessionService: SessionService) { }

  @ViewChild('dataTableIstance') dt: DataTable;
  ngOnInit() {
    var root = this;
    this.routeService.getAllRoutes()
      .subscribe((result: any) => {
        this.tableMessage = "Nessun itinerario corrispondente ai filtri indicati";
        this.allRoutes = $.extend({}, result.routes);
        this.routes = result.routes.sort((a, b) => { return (b.id - a.id) });
        this.filterBounds = root.calcFilterBounds(this.routes);
      },
      err => console.log(err));

    //UtilityService.resizeToParent($('.tableContainer'), -42);
    this.sessionService.addOnSigninCallback(() => {
      this.bookmarkedFilters = [this.defaultBookmarkedFilter];
      let session = this.sessionService.getSession();
      let sessionFilters = session.savedFilters.reduce((sessionFilters: any[], filter: Filter) => sessionFilters.concat(new ConcreteSelectItem(filter.name, filter.name)), new Array<ConcreteSelectItem>())
      this.bookmarkedFilters = this.bookmarkedFilters.concat(sessionFilters);
    });

    // thanks to https://stackoverflow.com/a/46370483/1306679
    this.dt.filterConstraints['atMost'] = function atMost(value: number, filterValue: any): boolean {
      if (filterValue === undefined || filterValue === null)
        return true;
      if (value == null)
        return false;
      return value <= filterValue;
    }
  }

  calcFilterBounds(routes: Route[]): FilterBounds {
    var root = this;
    var filterBounds = new FilterBounds();
    var dictionary;
    // Ottenimento dei possibili valori dei luoghi da visitare
    dictionary = routes.reduce((dictionary, route) => dictionary.add(route.luogo), new Set<string>());
    dictionary.forEach(place => filterBounds.places.push(new ConcreteSelectItem(place, place)));

    // Possibili valori delle difficoltà degli itinerari
    dictionary = routes.reduce((dictionary, route) => dictionary.add(route.difficolta), new Set<string>());
    dictionary.forEach(difficulty => filterBounds.difficulties.push(new ConcreteSelectItem(difficulty, difficulty)));

    filterBounds.periods = [
      new ConcreteSelectItem('Inverno', 'Inverno'),
      new ConcreteSelectItem('Primavera', 'Primavera'),
      new ConcreteSelectItem('Estate', 'Estate'),
      new ConcreteSelectItem('Autunno', 'Autunno')
    ];
    // Data minima e massima
    var routesToSort = JSON.parse(JSON.stringify(routes));
    var sorted = routesToSort.sort((a, b) => { return (a.id - b.id) });
    filterBounds.minDate = new Date(sorted[0].data);
    filterBounds.maxDate = new Date(sorted[sorted.length - 1].data);

    // Bounds di lunghezza
    sorted = routesToSort.sort((a, b) => { return (a.lunghezza - b.lunghezza) });
    filterBounds.minRouteLength = sorted[0].lunghezza;
    filterBounds.maxRouteLength = sorted[sorted.length - 1].lunghezza;

    // Bounds di durata
    sorted = routesToSort.sort((a, b) => { return (a.durata - b.durata) });
    filterBounds.minDuration = sorted[0].durata;
    filterBounds.maxDuration = sorted[sorted.length - 1].durata

    // Bounds di durata
    sorted = routesToSort.sort((a, b) => { return (a.dislivello - b.dislivello) });
    filterBounds.minElevation = sorted[0].dislivello;
    filterBounds.maxElevation = sorted[sorted.length - 1].dislivello
    return filterBounds;
  }

  loadBookmarkedRoutes() {
    let session = this.sessionService.getSession();
    if (session == null)
      return;

    this.bookmarkedRoutes = !this.bookmarkedRoutes;
    if (this.bookmarkedRoutes)
      this.routes = this.sessionService.getSession().savedRoutes;
    else
      this.routes = $.extend([], this.allRoutes).sort((a, b) => { return (b.id - a.id) });
  }

  // gestione dei filtri preferiti
  bookmarkedFilterChanged(filterName: string) {
    let session = this.sessionService.getSession();
    if (!session)
      return;

    if (filterName == this.defaultBookmarkedFilter.value) {
      this.bookmarkedFilterModal = true;
      this.erroreCorrenteFilters = "";
      return;
    }

    this.routeService.getFilter(filterName, session.loginToken)
      .subscribe((result: any) => {
        if (!result.Return)
          return;

        this.filterValues = new Filter();
        this.filterValues.name = result.filter.name;
        this.filterValues.filtroDislivello = result.filter.filtroDislivello;
        this.filterValues.filtroLunghezza = result.filter.filtroLunghezza;
        this.filterValues.filtroDurata = result.filter.filtroDurata;
        //TEMPORARY FIX: may the lord forgive me
        this.filterValues.filtroDifficolta = result.filter.filtroDifficolta ? [].concat(result.filter.filtroDifficolta) : null;
        this.filterValues.filtroLuoghi = result.filter.filtroLuoghi ? [].concat(result.filter.filtroLuoghi) : null;
        this.filterValues.filtroPeriodi = result.filter.filtroPeriodi ? [].concat(result.filter.filtroPeriodi) : null;
      //END OF TEMPORARY FIX
        this.applyFiltersToTable();
      }, err => console.log(err));
  }

  saveNewFilter(filterName: string) {
    let session = this.sessionService.getSession();
    if (!session)
      return;
    if (filterName == '')
      this.erroreCorrenteFilters = "Non può essere salvato un gruppo filtro con nome vuoto";
    if (this.filterValues.isEmpty())
      this.erroreCorrenteFilters = "Nessun filtro impostato";
    if (this.erroreCorrenteFilters != '')
      return;

    let filter = <any>$.extend({}, this.filterValues);

    filter.name = filterName;

    //TEMPORARY FIX: may the lord forgive me
    if (filter.filtroDifficolta != null && filter.filtroDifficolta.length)
      filter.filtroDifficolta = filter.filtroDifficolta[0];
    if (filter.filtroLuoghi != null && filter.filtroLuoghi.length)
      filter.filtroLuoghi = filter.filtroLuoghi[0];
    if (filter.filtroPeriodi != null && filter.filtroPeriodi.length)
      filter.filtroPeriodi = filter.filtroPeriodi[0];
    //END OF TEMPORARY FIX
    this.routeService.saveFilter(filter, session.loginToken)
      .subscribe((result: any) => {
        if (!result.Return) {
          if (result.error == "ALREADY_SAVED ROUTE")
            this.erroreCorrenteFilters = "Esiste già un altro gruppo filtri con lo stesso nome";
          return;
        }
        this.bookmarkedFilters.push(new ConcreteSelectItem(filterName, filterName));
        this.sessionService.getSession().savedFilters.push(filter);
        this.bookmarkedFilterSelected = filterName;
        this.closeBookmarkFilterModal();
      }, err => {
        this.bookmarkedFilterSelected = null;
      });
  }
  closeBookmarkFilterModal(fromCancel?: boolean) {
    this.bookmarkedFilterModal = false;

    // resettiamo il selezionatore se l'utente annulla il salvataggio di un nuovo filtro
    if (fromCancel && this.bookmarkedFilterSelected == this.defaultBookmarkedFilter.value)
      this.bookmarkedFilterSelected = null;
  }

  // purtroppo non c'è modo altro modo per effettuare un refresh manuale della tabella
  applyFiltersToTable() {
    this.dt.filter(this.filterValues.filtroPeriodi, 'periodo', 'in')
    this.dt.filter(this.filterValues.filtroDurata, 'durata', 'atMost');
    this.dt.filter(this.filterValues.filtroLunghezza, 'lunghezza', 'atMost')
    this.dt.filter(this.filterValues.filtroDislivello, 'dislivello', 'atMost')
    this.dt.filter(this.filterValues.filtroDifficolta, 'difficolta', 'in')
    this.dt.filter(this.filterValues.filtroLuoghi, 'luogo', 'in')
  }

  roundFiltroLunghezza(filtroLunghezza: number): number {
    return Math.floor(filtroLunghezza);
  }
}

class ConcreteSelectItem implements SelectItem {
  constructor(
    public value: any,
    public label: string) {
  }
}
