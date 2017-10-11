/// In questo file va posta tutta la logica di input-output per il dbHandler
const Route = require('../code/Route.js');

var dummyValues = [
  new Route(102, 9138, 367, 'E', "percorso molto bello nella lama"),
  new Route(103, 7580, 269, 'T', "Altro percorso bellissimo")
];

module.exports = {
  getRoutes: function() {
    // ottenimento dei valori da DB
    return dummyValues;
  },
  login: function(username, passwd) {
    // effettuazione della login
  },
  insertFilters: function(loginToken, routes) {
    // inserimento dei filtri salvati
  }
}
