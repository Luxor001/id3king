const Route = require('./Route.js');

module.exports = class RouteDetail extends Route {
  constructor(id, titolo, data, durata, lunghezza, dislivello, difficolta, luogo, descrizione, url, mapUrl, trackUrl, saved) {
    super(id, titolo, data, durata, lunghezza, dislivello, difficolta, luogo, descrizione);
    this.url = url;
    this.mapUrl = mapUrl;
    this.trackUrl = trackUrl;

    // saved indica se tale route è salvata tra i preferiti dell'utente
    this.saved = saved == null ? false : true;
  }
}
