import { SelectItem } from 'primeng/primeng';

export class FilterValues {
  name: string;
  filtroDislivello: number;
  filtroLunghezza: number;
  filtroDurata: number;
  filtroDifficolta: SelectItem[];
  filtroLuoghi: SelectItem[];
  filtroPeriodi: SelectItem[];
  constructor() { }
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
