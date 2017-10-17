/// In questo file va posta tutta la logica di input-output per il dbHandler
const Route = require('../code/Route.js');

var dummyValues = [
  new Route(102, 9138, 367, 'E', "percorso molto bello nella lama"),
  new Route(103, 7580, 269, 'T', "Altro percorso bellissimo"),
  new Route(104, 1235, 500, 'E', "Proin eget tortor risus. Donec rutrum congue leo eget malesuada. "),
  new Route(105, 5432, 412, 'E', "Praesent sapien massa, convallis a pellentesque nec, egestas"),
  new Route(106, 7542, 123, 'E', "Vivamus magna justo, lacinia eget consectetur sed, convallis"),
  new Route(107, 8521, 234, 'E', "Sed porttitor lectus nibh. Vivamus suscipit tortor eget feli"),
  new Route(108, 9864, 345, 'E', "Vestibulum ante ipsum primis in faucibus orci luctus et ultr"),
  new Route(109, 3462, 678, 'E', "Donec velit neque, auctor sit amet aliquam vel, ullamcorper "),
  new Route(111, 8452, 906, 'E', "Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a."),
  new Route(112, 3333, 987, 'E', "accumsan id imperdiet et, porttitor at sem. Vivamus suscipit"),
  new Route(113, 1334, 555, 'E', "Proin eget tortor risus. Donec rutrum congue leo eget malesuada. "),
  new Route(114, 5555, 666, 'E', "Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.")
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
