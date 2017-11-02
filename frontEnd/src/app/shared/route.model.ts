export class Route {
  constructor(public id: number,
    public titolo: string,
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
