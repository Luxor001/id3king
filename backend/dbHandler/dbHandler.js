/// In questo file va posta tutta la logica di input-output per il dbHandler
const Route = require('../code/Route.js');

var dummyValues = [
  new Route(102, new Date('01/01/2017'), 100, 20, 367, 'E', "La Lama", "percorso molto bello nella lama"),
  new Route(103, new Date('02/01/2017'), 150, 20, 269, 'T', "La Lama", "Altro percorso bellissimo"),
  new Route(104, new Date('03/01/2017'), 200, 19, 500, 'E', "Sasso Simone", "Proin eget tortor risus. Donec rutrum congue leo eget malesuada. "),
  new Route(105, new Date('04/01/2017'), 250, 19, 412, 'E', "Sasso Simone", "Praesent sapien massa, convallis a pellentesque nec, egestas"),
  new Route(106, new Date('05/01/2017'), 300, 18, 123, 'E', "Ridracoli", "Vivamus magna justo, lacinia eget consectetur sed, convallis"),
  new Route(107, new Date('06/01/2017'), 350, 18, 234, 'E', "Ridracoli", "Sed porttitor lectus nibh. Vivamus suscipit tortor eget feli"),
  new Route(108, new Date('07/01/2017'), 400, 17, 345, 'E', "Campo dell'agio", "Vestibulum ante ipsum primis in faucibus orci luctus et ultr"),
  new Route(109, new Date('08/01/2017'), 450, 17, 678, 'E', "Campo dell'agio", "Donec velit neque, auctor sit amet aliquam vel, ullamcorper "),
  new Route(111, new Date('09/01/2017'), 500, 16, 906, 'E', "Valle del savio", "Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a."),
  new Route(112, new Date('10/01/2017'), 550, 16, 987, 'E', "Valle del savio", "accumsan id imperdiet et, porttitor at sem. Vivamus suscipit"),
  new Route(113, new Date('11/01/2017'), 600, 15, 555, 'E', "Alpe della luna", "Proin eget tortor risus. Donec rutrum congue leo eget malesuada. "),
  new Route(114, new Date('12/01/2017'), 650, 15, 666, 'E', "Alpe della luna", "Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.")
];

dummyValues = dummyValues.concat(dummyValues, dummyValues, dummyValues);
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
