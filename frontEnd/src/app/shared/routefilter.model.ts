import { SelectItem } from 'primeng/primeng';

export class Filter {
  name: string;
  filtroDislivello: number;
  filtroLunghezza: number;
  filtroDurata: number;
  filtroDifficolta: SelectItem[];
  filtroLuoghi: SelectItem[];
  filtroPeriodi: SelectItem[];
  constructor() { }

  isEmpty(){
    return this.filtroDislivello == null && this.filtroLunghezza == null && this.filtroDurata == null && this.filtroDifficolta == null &&  this.filtroLuoghi == null && this.filtroPeriodi == null;
  }
}

export class FilterBounds {
  places: SelectItem[] = [];
  difficulties: SelectItem[] = [];
  periods: SelectItem[] = [];
  maxRouteLength: number;
  minRouteLength: number;
  minDuration: number;
  maxDuration: number;
  minElevation: number;
  maxElevation: number;
  minDate: Date;
  maxDate: Date;

  constructor() { }
}
