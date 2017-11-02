import {Route} from './route.model'

export class RouteDetail extends Route {
  constructor(id: number,
    titolo: string,
    data: Date,
    durata: number,
    lunghezza: number,
    dislivello: number,
    difficolta: string,
    luogo: string,
    descrizione: string,
    periodo: string,
    public url: string,
    public mapUrl: string,
    public trackUrl: string,
    public saved: boolean) {
    super(id, titolo, data, durata, lunghezza, dislivello, difficolta, luogo, descrizione, periodo);
  }
}
