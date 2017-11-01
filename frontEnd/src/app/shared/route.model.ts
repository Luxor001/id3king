export class Route {
  constructor(public id: number,
    public data: Date,
    public durata: number,
    public lunghezza: number,
    public dislivello: number,
    public difficolta: string,
    public luogo: string,
    public descrizione: string,
    public periodo: string) {
  }
}

export class RouteDetail extends Route {
  constructor(id: number,
    data: Date,
    durata: number,
    lunghezza: number,
    dislivello: number,
    difficolta: string,
    luogo: string,
    descrizione: string,
    periodo: string,
    public url: string) {
    super(id, data, durata, lunghezza, dislivello, difficolta, luogo, descrizione, periodo);

  }
}
