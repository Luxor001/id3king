const config = require('../config');
// In questo file va posta tutta la logica di input-output per il dbHandler
const {
  IncorrectPasswordLengthException,
  PasswordsNotEqualsException,
  UsernameAlreadyExistException,
  IncorrectLoginException,
  RouteNotFoundException,
  AlreadyExistingFilterException
} = require('./dbHandlerExceptions.js');
const Route = require('../code/Route.js');
const RouteDetail = require('../code/RouteDetail.js');
const User = require('../code/User.js');
const Filter = require('../code/Filter.js');
const UserLogin = require('../code/UserLogin.js');

const database = require('mysql');
const Bcrypt = require('bcrypt'); // use bcrypt to hash passwords.
const randtoken = require('rand-token');

const DEFAULT_SALTROUNDS = 10; // TODO: da generare random. Non deve essere costante.

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
    let results = [];
    var sql = 'SELECT p.ID,p.Nome,p.DataInizio,p.Durata,p.Lunghezza,p.Dislivello,d.Valore,l.Denominazione,Descrizione FROM Percorso p JOIN difficolta d2 ON p.Difficolta=d2.ID JOIN localita l2 ON p.Localita=l2.ID , difficolta d, localita l;';
    return executeQuery(sql).then(function(routesResults) {
      if (routesResults != null) {
        routesResults.forEach(function(item, index) {
          results.push(new Route(item.ID, item.Nome, item.DataInizio, item.Durata, item.Lunghezza, item.Dislivello, item.Valore, item.Denominazione, item.Descrizione));
        });
        return results;
      }
    });
  },

  getRouteDetails: function(routeId) {
    // Ottenimento dei dettagli su uno specifico percorso
    let results;
    let sql = 'SELECT p.ID,p.Nome,p.DataInizio,p.Durata,p.Lunghezza,p.Dislivello,d.Valore,l.Denominazione,p.Descrizione,p.URL,p.MapURL,p.TrackURL FROM Percorso p JOIN difficolta d2 ON d2.ID=p.Difficolta JOIN localita l2 ON l2.ID=p.Localita , difficolta d, localita l WHERE p.ID=' + database.escape(routeId) + ';';
    return executeQuery(sql).then(function(routesResults) {
      if (routesResults != null) {
        results = new RouteDetail(routesResults[0].ID, routesResults[0].Nome, routesResults[0].DataInizio, routesResults[0].Durata, routesResults[0].Lunghezza, routesResults[0].Dislivello, routesResults[0].Valore, routesResults[0].Denominazione, routesResults[0].Descrizione, routesResults[0].URL, routesResults[0].MapURL, routesResults[0].TrackURL);
        // TODO: inserire un +1 nel cotatore delle route a scopi statistici
        return results;
      } else {
        throw new RouteNotFoundException(); // Non esiste un percorso con l'id specificato. TODO: da gestire lato front end
      }
    });
  },

  saveRoute: function(routeId, loginToken) {
    // TODO: if(this.checkToken(loginToken)) (controllare se il token di login utente esiste)
    let route = dummyValues.find(route => route.id == routeId);
    route.saved = !route.saved;
    // TODO: UPDATE... (inserire nella tabella delle route salvate dell'utente la corrente (routeId))
    return route;
  },

  signin: signin,

  signup: function(userLogin) {
    //userLogin = new UserLogin("test", "prova", "prova"); // Utente di test
    if (userLogin.password == null || userLogin.password.length < config.security.password_min_length)
      throw new IncorrectPasswordLengthException();
    if (userLogin.passwordConfirm != userLogin.password)
      throw new PasswordsNotEqualsException();
    let sqlCheckUserAlreadyExists = 'SELECT ID FROM Utenti WHERE username=' + database.escape(userLogin.username) + ';';
    return executeQuery(sqlCheckUserAlreadyExists).then(function(userId) {
      if(userId.length != 0) // L'utente esiste già
        throw new UsernameAlreadyExistException();
      return Bcrypt.hash(userLogin.password, DEFAULT_SALTROUNDS);
    }).then(function OnHashedPassword(hashedPassword) {
      // Salvare nel database il nuovo utente
      let sqlAddUser = 'INSERT INTO `id3king`.`utenti` (`username`, `password`) VALUES (' + database.escape(userLogin.username) + ', ' + database.escape(userLogin.password) + ');';
      return executeQuery(sqlAddUser);
    }).then(function(result) {
      if(result.affectedRows != 1)
        throw new IncorrectLoginException(); // Errore durante l'inserimento del nuovo utente nel database
      // Generazione token, salvataggio sul database e restituzione al client
      return signin(userLogin);
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
    // filter = new Filter("ricercaprova", 10000, 30000, 1000, 2, 500, null); // Filtro di test
    // user = new User("test", null, null, null); // Utente di test
    let userId;
    let getUserIdSql = 'SELECT ID FROM Utenti WHERE username=' + database.escape(user.username) + ';'; // Id dell'utente, da ricavare a partire dall'username
    return executeQuery(getUserIdSql).then(function OnGetUserId(dbUserId) {
      if(dbUserId == null)
        throw new IncorrectLoginException();
      userId = dbUserId[0].ID;
      let sqlCheckIfAlreadySavedFilter = 'SELECT IDUtente FROM ricerca WHERE IDUtente=' + userId + ' AND NomeRicerca=' + database.escape(filter.name) + ';';
      return executeQuery(sqlCheckIfAlreadySavedFilter);
    }).then(function OnCheckedIfAlreadySavedFilter(checkResults) {
      if(checkResults.length != 0)
        throw new AlreadyExistingFilterException();
      let sqlAddFilterToDb = 'INSERT INTO `id3king`.`ricerca` (`IDUtente`, `NomeRicerca`, `DislivelloMassimo`, `LunghezzaMassima`, `DurataMassima`, `Localita`, `Difficolta`) VALUES (' + userId + ', ' + database.escape(filter.name) + ', ' + database.escape(filter.filtroDislivello) + ', ' + database.escape(filter.filtroLunghezza) + ', ' + database.escape(filter.filtroDurata) + ', ' + database.escape(filter.filtroLuoghi) + ', ' + database.escape(filter.filtroDifficolta) + ');';
      return executeQuery(sqlAddFilterToDb);
    }).then(function OnInsertedFilter(result) {
      if(result.affectedRows != 1)
        throw new IncorrectLoginException(); // Errore durante l'inserimento del token nel database
      return true;
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
  // loginToken = "aaaaaaaabbbbbbbbccccccccdddddddd"; // Token di test
  let userId;
  let userName;
  let lastRoute;
  let savedRoutes = [];
  let savedFilters = [];
  let sqlGetUserIdAndLastRoute = 'SELECT u.ID, u.username, u.UltimoPercorsoRicercato FROM utenti u INNER JOIN login l ON l.userId=u.ID AND l.logintoken=' + database.escape(loginToken) + ';';
  return executeQuery(sqlGetUserIdAndLastRoute).then(function OnGetUserIdAndLastRoute(dbUserIdAndLastRoute) {
    if(dbUserIdAndLastRoute == null)
      throw new IncorrectLoginException();
    userId = dbUserIdAndLastRoute[0].ID;
    userName = dbUserIdAndLastRoute[0].username;
    lastRoute = dbUserIdAndLastRoute[0].UltimoPercorsoRicercato;
    //let sqlGetSavedRoutesIds = 'SELECT IDPercorso FROM itinerariopreferito WHERE IDUtente=' + database.escape(userId) + ';';
    let sqlGetSavedRoutes = 'SELECT p.ID, p.Nome, p.DataInizio, p.Durata, p.Lunghezza, p.Dislivello, p.Difficolta, p.Localita, p.Descrizione FROM percorso p WHERE p.ID IN (SELECT ip.IDPercorso FROM itinerariopreferito ip WHERE ip.IDUtente=' + database.escape(userId) + ');';
    return executeQuery(sqlGetSavedRoutes);
  }).then(function OnGetSavedRoutesIds(savedRoutesDb) {
    savedRoutesDb.forEach(function(item, index) {
      savedRoutes.push(new RouteDetail(item.ID, item.Nome, item.DataInizio, item.Durata, item.Lunghezza, item.Dislivello, item.Difficolta, item.Localita, item.Descrizione, item.URL, item.MapURL, item.TrackURL));
    });
    let sqlGetSavedFilters = 'SELECT r.NomeRicerca, r.DislivelloMassimo, r.LunghezzaMassima, r.DurataMassima, r.Difficolta, r.Localita FROM ricerca r WHERE r.IDUtente=' + database.escape(userId) + ';';
    return executeQuery(sqlGetSavedFilters);
  }).then(function OnGetSavedFilters(savedFiltersDb) {
    savedFiltersDb.forEach(function(item, index) {
      savedFilters.push(new Filter(item.NomeRicerca, item.DislivelloMassimo, item.LunghezzaMassima, item.DurataMassima, item.Difficolta, item.Localita));
    });
    return new User(userName, lastRoute, savedRoutes, savedFilters);
  });
}

function loginExist(username) {
  // TODO: SELECT...
  return "asdsa";
}

// Metodo di utilità per eseguire una query sul database. Restituisce un array contenente i risultati
function executeQuery(querySQL) {
  return new Promise((resolve, reject) => {
    const dbconnection = database.createConnection(config.dbConnection);
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

function signin(userLogin) {
  //userLogin = new UserLogin("test", "prova", "prova"); // Utente di test
  let sqlGetPassword = 'SELECT password FROM utenti WHERE username=' + database.escape(userLogin.username) + ';'; // Ricavare la password dell'utente in base all'username fornito
  return executeQuery(sqlGetPassword).then(function(dbPassword) {
    if(dbPassword == null)
      throw new IncorrectLoginException(); // L'utente non esiste
    return Bcrypt.compare(userLogin.password, dbPassword[0].password);
  }).then(function OnComparePassword(compareResult) {
    if (!compareResult)
      throw new IncorrectLoginException(); // La password inserita non coincide con quella nel database
    let getUserIdSql = 'SELECT ID FROM Utenti WHERE username=' + database.escape(userLogin.username) + ';'; // Id dell'utente, da ricavare a partire dall'username
    return executeQuery(getUserIdSql);
  }).then(function OngetUserId (dbUserId){
    if(dbUserId == null)
      throw new IncorrectLoginException();
    // Se il login ha avuto successo, generare un token, salvarlo sul database e restituirlo al client
    var currentDateSQL = new Date().toISOString().slice(0, 19).replace('T', ' '); // Data attuale convertita nel formato DATETIME di MySql
    let loginToken = randtoken.generate(32);
    var insertSql = 'INSERT INTO Login (`userId`, `logintoken`, `timestamp`) VALUES (?, ?, ?);';
    var insertsInsert = [dbUserId[0].ID, loginToken, currentDateSQL];
    insertSql = database.format(insertSql, insertsInsert);
    return executeQuery(insertSql).then(function(result) {
      if(result.affectedRows != 1)
        throw new IncorrectLoginException(); // Errore durante l'inserimento del token nel database
      return loginToken;
    });
  });
}
