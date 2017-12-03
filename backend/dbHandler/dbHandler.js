/// In questo file va posta tutta la logica di input-output per il dbHandler
const {
  IncorrectPasswordLengthException,
  PasswordsNotEqualsException,
  UsernameAlreadyExistException,
  IncorrectLoginException
} = require('./dbHandlerExceptions.js');
const Route = require('../code/Route.js');
const RouteDetail = require('../code/RouteDetail.js');
const User = require('../code/User.js');
const Filter = require('../code/Filter.js');
const database = require('mysql');


//FIXME: da cancellare
const hashed_prova_pass = "$2a$10$sqfzhsD1waUvTFKFApoki./Fio5YOqFm75jHW0OvAfwRg5LXJqkCK";

let Bcrypt = require('bcrypt'); // use bcrypt to hash passwords.
let randtoken = require('rand-token');

const PASSWORD_MIN_LENGTH = 5;
const DEFAULT_SALTROUNDS = 10;

var dummyValues = [
  new RouteDetail(102, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('01/01/2017'), 100, 20, 367, 'E', "La Lama", "percorso molto bello nella lama", "http://www.id3king.it/Uscite/U2002/Uscita102/indice_102.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar"),
  new RouteDetail(103, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('02/01/2017'), 150, 20, 269, 'T', "La Lama", "Altro percorso bellissimo", "http://www.id3king.it/Uscite/U2002/Uscita103/indice_103.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar"),
  new RouteDetail(104, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('03/01/2017'), 200, 19, 500, 'E', "Sasso Simone", "Proin eget tortor risus. Donec rutrum congue leo eget malesuada.", "http://www.id3king.it/Uscite/U2002/Uscita101/indice_101.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar"),
  new RouteDetail(105, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('04/01/2017'), 250, 19, 412, 'E', "Sasso Simone", "Praesent sapien massa, convallis a pellentesque nec, egestas", "http://www.id3king.it/Uscite/U2002/Uscita101/indice_101.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar"),
  new RouteDetail(106, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('05/01/2017'), 300, 18, 123, 'E', "Ridracoli", "Vivamus magna justo, lacinia eget consectetur sed, convallis", "http://www.id3king.it/Uscite/U2002/Uscita101/indice_101.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar"),
  new RouteDetail(107, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('06/01/2017'), 350, 18, 234, 'E', "Ridracoli", "Sed porttitor lectus nibh. Vivamus suscipit tortor eget feli", "http://www.id3king.it/Uscite/U2002/Uscita101/indice_101.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar"),
  new RouteDetail(108, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('07/01/2017'), 400, 17, 345, 'E', "Campo dell'agio", "Vestibulum ante ipsum primis in faucibus orci luctus et ultr", "http://www.id3king.it/Uscite/U2002/Uscita101/indice_101.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar"),
  new RouteDetail(109, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('08/01/2017'), 450, 17, 678, 'E', "Campo dell'agio", "Donec velit neque, auctor sit amet aliquam vel, ullamcorper ", "http://www.id3king.it/Uscite/U2002/Uscita101/indice_101.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar"),
  new RouteDetail(111, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('09/01/2017'), 500, 16, 906, 'E', "Valle del savio", "Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a.", "http://www.id3king.it/Uscite/U2002/Uscita101/indice_101.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar"),
  new RouteDetail(112, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('10/01/2017'), 550, 16, 987, 'E', "Valle del savio", "accumsan id imperdiet et, porttitor at sem. Vivamus suscipit", "http://www.id3king.it/Uscite/U2002/Uscita101/indice_101.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar"),
  new RouteDetail(113, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('11/01/2017'), 600, 15, 555, 'E', "Alpe della luna", "Proin eget tortor risus. Donec rutrum congue leo eget malesuada.", "http://www.id3king.it/Uscite/U2002/Uscita101/indice_101.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar"),
  new RouteDetail(114, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('12/01/2017'), 650, 15, 666, 'E', "Alpe della luna", "Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.", "http://www.id3king.it/Uscite/U2002/Uscita101/indice_101.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar")
];

dummyValues = dummyValues.concat(dummyValues, dummyValues, dummyValues);
module.exports = {
  getRoutes: function() {
    // Ottenimento tutti i percorsi
    return new Promise((resolve, reject) => {
      let results = [];
      var sql = 'SELECT ID,Nome,DataInizio,Durata,Lunghezza,Dislivello,Difficolta,Localita,Descrizione FROM Percorso;';
      executeQuery(sql).then(function(routesResults) {
        if (routesResults != null) {
          routesResults.forEach(function(item, index) {
            results.push(new Route(item.ID, item.Nome, item.DataInizio, item.Durata, item.Lunghezza, item.Dislivello, item.Difficolta, item.Localita, item.Descrizione));
          });
          resolve(results);
        }
      });
    })
  },

  getRouteDetails: function(routeId) {
    // Ottenimento dei dettagli su uno specifico percorso
    return new Promise((resolve, reject) => {
      let results;
      var sql = 'SELECT ID,Nome,DataInizio,Durata,Lunghezza,Dislivello,Difficolta,Localita,Descrizione FROM Percorso WHERE ID=?;';
      var inserts = [routeId];
      sql = database.format(sql,inserts);
      executeQuery(sql).then(function(routesResults) {
        if (routesResults != null) {
          results = new Route(routesResults[0].ID, routesResults[0].Nome, routesResults[0].DataInizio, routesResults[0].Durata, routesResults[0].Lunghezza, routesResults[0].Dislivello, routesResults[0].Difficolta, routesResults[0].Localita, routesResults[0].Descrizione);
          resolve(results);
        } else {
          //TODO: non esiste un percorso con l'id specificato
        }
      });
    })
  },

  saveRoute: function(routeId, loginToken) {
    // TODO: if(this.checkToken(loginToken)) (controllare se il token di login utente esiste)
    let route = dummyValues.find(route => route.id == routeId);
    route.saved = !route.saved;
    // TODO: UPDATE... (inserire nella tabella delle route salvate dell'utente la corrente (routeId))
    return route;
  },


  signin: function(userLogin) {
    // TODO: ricavare password dell'utente in base all'username fornito
    // let hashedPasswordOnDb = "";
    return Bcrypt.compare(userLogin.password, hashed_prova_pass).then(function(result) {
      if (!result)
        throw new IncorrectLoginException();

      // TODO: salvare il token su DB!
      let loginToken = randtoken.generate(32);
      return loginToken;
    });
  },

  signup: function(userLogin) {
    return new Promise(function(resolve, reject) {
      //TODO: SANITIZZAZIONE SQL!. Vedere https://stackoverflow.com/a/15778841/1306679

      if (userLogin.password == null || userLogin.password.length < PASSWORD_MIN_LENGTH)
        throw new IncorrectPasswordLengthException();
      if (userLogin.passwordConfirm != userLogin.password)
        throw new PasswordsNotEqualsException();

      //TODO: check se esiste già un user con lo stesso nome
      if (userLogin.username == "prova")
        throw new UsernameAlreadyExistException();

      // ritorna una promise. fare .then dall'altra parte
      Bcrypt.hash(userLogin.password, DEFAULT_SALTROUNDS).then(function(hash) {
        //TODO: save in DB la password hashata e l'username

        let loginToken = randtoken.generate(32);
        //TODO: salvare il token su DB!
        resolve(loginToken);
      });
    });
  },

  checkToken: function(loginToken) {
    return new Promise(function(resolve, reject) {
      //TODO: controllare se il logintoken esiste e, in caso, ritornare a che utente appartiene...
      // if(loginTokenDoesNOTexist...)
      // throw new IncorrectLoginException();
      var username = 'Luxor001';
      resolve(getUserInfo(username));
    });
  },

  saveFilter: function(filter, user) {
    return new Promise(function(resolve, reject){
        //TODO: da fare tutta la logica di salvataggio di un filtro su db...
        //INSERT (filter.name)
        resolve(true);
    });
  },

  getUserInfo: getUserInfo,

  getFilter: function(loginToken, routes) {
    return new Promise(function(resolve, reject){
        //TODO: da fare tutta la logica di salvataggio di un filtro su db...
        //INSERT (filter.name)
        let filter = new Filter('savedFilter', 500, 100, 100, ['E'], ['La Lama'], ['Primavera'])
        resolve(filter);
    });
    //TODO: da fare tutta la logica di ricerca di un filtro utente
    // inserimento dei filtri salvati
  }
}

function getUserInfo(loginToken) {
  //TODO: richiedere al DB info sull'utente
  return new User('Luxor001', '101', [
    new RouteDetail(102, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('01/01/2017'), 100, 20, 367, 'E', "La Lama", "percorso molto bello nella lama", "http://www.id3king.it/Uscite/U2002/Uscita102/indice_102.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar"),
    new RouteDetail(106, "S. Piero in Bagno, Bagno di Romagna e il versante West del Monte Comero", new Date('05/01/2017'), 300, 18, 123, 'E', "Ridracoli", "Vivamus magna justo, lacinia eget consectetur sed, convallis", "http://www.id3king.it/Uscite/U2002/Uscita101/indice_101.htm", "http://www.id3king.it/Uscite/U2002/Uscita100/Images100/mappa100.jpg", "http://www.id3king.it/Tracce/U100%20FalterBagnoPoppiBadiaP.rar")
    ], []);
}

function loginExist(username) {
  // TODO: SELECT...
  return "asdsa";
}

function executeQuery(querySQL) {
  return new Promise((resolve, reject) => {
    const dbconnection = database.createConnection({
      //TODO questi dati dovrebbero stare su un file di configurazione, non hardcoded
      host: 'localhost',
      user: 'id3king',
      password: 'id3king',
      database: 'id3king'
    });
    dbconnection.connect();
    dbconnection.query(querySQL, function(err, rows, fields) {
      if(err != null) {
          console.log(err);
          // TODO: throw exception?
      }
      dbconnection.end();
      resolve(rows);
    });
  });
}
