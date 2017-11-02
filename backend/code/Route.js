module.exports = class Route {
  constructor(id, titolo, data, durata, lunghezza, dislivello, difficolta, luogo, descrizione) {
    this.id = id;
    this.titolo = titolo;
    this.data = data;
    this.durata = durata;
    this.lunghezza = lunghezza;
    this.dislivello = dislivello;
    this.difficolta = difficolta;
    this.luogo = luogo;
    this.descrizione = descrizione;
  }
}
