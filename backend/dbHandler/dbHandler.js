const config = require('../config');
// In questo file va posta tutta la logica di input-output per il dbHandler
const {
  IncorrectPasswordLengthException,
  PasswordsNotEqualsException,
  UsernameAlreadyExistException,
  IncorrectLoginException,
  RouteNotFoundException,
  AlreadySavedRouteException,
  AlreadyExistingFilterException,
  NotExistingFilterException,
  FailedDatabaseQueryException
} = require('./dbHandlerExceptions.js');
const Route = require('../code/Route.js');
const RouteDetail = require('../code/RouteDetail.js');
const User = require('../code/User.js');
const Filter = require('../code/Filter.js');
const UserLogin = require('../code/UserLogin.js');

const database = require('mysql');
const Bcrypt = require('bcrypt');
const randtoken = require('rand-token');

module.exports = {
  getRoutes: function() {
    // Ottenimento tutti i percorsi
    let results = [];
    const sql = 'SELECT p.ID,p.Nome,p.DataInizio,p.Durata,p.Lunghezza,p.Dislivello,d.Valore,l.Denominazione,Descrizione FROM Percorso p JOIN difficolta d2 ON p.Difficolta=d2.ID JOIN localita l2 ON p.Localita=l2.ID , difficolta d, localita l;';
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
    // routeId = 2017; // Percorso di test
    let results;
    const sql = 'SELECT p.ID,p.Nome,p.DataInizio,p.Durata,p.Lunghezza,p.Dislivello,d.Valore,l.Denominazione,p.Descrizione,p.URL,p.MapURL,p.TrackURL,p.ContatoreAccessi FROM Percorso p JOIN difficolta d2 ON d2.ID=p.Difficolta JOIN localita l2 ON l2.ID=p.Localita , difficolta d, localita l WHERE p.ID=' + database.escape(routeId) + ' AND d.ID=p.Difficolta;';
    return executeQuery(sql).then(function(routesResults) {
      if (routesResults == null)
        throw new RouteNotFoundException(); // Non esiste un percorso con l'id specificato.
      results = new RouteDetail(routesResults[0].ID, routesResults[0].Nome, routesResults[0].DataInizio, routesResults[0].Durata, routesResults[0].Lunghezza, routesResults[0].Dislivello, routesResults[0].Valore, routesResults[0].Denominazione, routesResults[0].Descrizione, routesResults[0].URL, routesResults[0].MapURL, routesResults[0].TrackURL);
      // Incremento del contatore degli accessi del percorso corrente a scopi statistici
      const sqlIncrementRouteCounter = 'UPDATE `id3king`.`percorso` SET `ContatoreAccessi`=' + parseInt(routesResults[0].ContatoreAccessi+1) + ' WHERE  `ID`=' + database.escape(routeId) + ';';
      return executeQuery(sqlIncrementRouteCounter);
    }).then(function OnIncrementRouteCounter(result) {
      if(result.affectedRows != 1)
        throw new RouteNotFoundException(); // Errore durante l'incremento del contatore nel database
      return results;
    });
  },

  saveRoute: function(routeId, loginToken) {
    // routeId = 2017; // Percorso di test
    // loginToken = "aaaaaaaabbbbbbbbccccccccdddddddd"; // Token di test
    const sqlGetUserId = 'SELECT userID FROM login WHERE logintoken=' + database.escape(loginToken) + ';';
    return executeQuery(sqlGetUserId).then(function OnGetUserId(dbUserId) {
      if(dbUserId == null) // Il token non esiste
        throw new IncorrectLoginException();
      const sqlCheckIfAlreadySavedRoute = 'SELECT * FROM itinerariopreferito WHERE IDUtente=' + database.escape(dbUserId[0].userID) + ' AND IDPercorso=' + database.escape(routeId) + ';';
      return executeQuery(sqlCheckIfAlreadySavedRoute);
    }).then(function OnCheckIfAlreadySavedRoute(alreadySavedRoute) {
      if(alreadySavedRoute != null)
        throw new AlreadySavedRouteException();
      const sqlInsertRoute = 'INSERT INTO `id3king`.`itinerariopreferito` (`IDUtente`, `IDPercorso`) VALUES (' + database.escape(dbUserId[0].userID) + ', ' + database.escape(routeId) + ');';
      return executeQuery(sqlInsertRoute);
    }).then(function OnInsertRoute(result) {
      if(result.affectedRows != 1)
        throw new IncorrectLoginException(); // Errore durante l'inserimento del token nel database
      return true;
    });
  },

  signin: signin,

  signup: function(userLogin) {
    //userLogin = new UserLogin("test", "prova", "prova"); // Utente di test
    if (userLogin.password == null || userLogin.password.length < config.security.password_min_length)
      throw new IncorrectPasswordLengthException();
    if (userLogin.passwordConfirm != userLogin.password)
      throw new PasswordsNotEqualsException();
    const sqlCheckUserAlreadyExists = 'SELECT ID FROM Utenti WHERE username=' + database.escape(userLogin.username) + ';';
    return executeQuery(sqlCheckUserAlreadyExists).then(function(userId) {
      if(userId.length != 0) // L'utente esiste già
        throw new UsernameAlreadyExistException();
      var saltRounds = Math.floor(Math.random()*100)+1;
      return Bcrypt.hash(userLogin.password, saltRounds);
    }).then(function OnHashedPassword(hashedPassword) {
      // Salvare nel database il nuovo utente
      const sqlAddUser = 'INSERT INTO `id3king`.`utenti` (`username`, `password`) VALUES (' + database.escape(userLogin.username) + ', ' + database.escape(userLogin.password) + ');';
      return executeQuery(sqlAddUser);
    }).then(function(result) {
      if(result.affectedRows != 1)
        throw new IncorrectLoginException(); // Errore durante l'inserimento del nuovo utente nel database
      // Generazione token, salvataggio sul database e restituzione al client
      return signin(userLogin);
    });
  },

  saveFilter: function(filter, user) {
    // filter = new Filter("ricercaprova", 10000, 30000, 1000, 2, 500, null); // Filtro di test
    // user = new User("test", null, null, null); // Utente di test
    let userId;
    const sqlGetUserId = 'SELECT ID FROM Utenti WHERE username=' + database.escape(user.username) + ';'; // Id dell'utente, da ricavare a partire dall'username
    return executeQuery(sqlGetUserId).then(function OnGetUserId(dbUserId) {
      if(dbUserId == null)
        throw new IncorrectLoginException();
      userId = dbUserId[0].ID;
      const sqlCheckIfAlreadySavedFilter = 'SELECT IDUtente FROM ricerca WHERE IDUtente=' + userId + ' AND NomeRicerca=' + database.escape(filter.name) + ';';
      return executeQuery(sqlCheckIfAlreadySavedFilter);
    }).then(function OnCheckedIfAlreadySavedFilter(checkResults) {
      if(checkResults.length != 0)
        throw new AlreadyExistingFilterException();
      const sqlAddFilterToDb = 'INSERT INTO `id3king`.`ricerca` (`IDUtente`, `NomeRicerca`, `DislivelloMassimo`, `LunghezzaMassima`, `DurataMassima`, `Localita`, `Difficolta`) VALUES (' + userId + ', ' + database.escape(filter.name) + ', ' + database.escape(filter.filtroDislivello) + ', ' + database.escape(filter.filtroLunghezza) + ', ' + database.escape(filter.filtroDurata) + ', ' + database.escape(filter.filtroLuoghi) + ', ' + database.escape(filter.filtroDifficolta) + ', ' + database.escape(filter.filtroPeriodi) + ');';
      return executeQuery(sqlAddFilterToDb);
    }).then(function OnInsertedFilter(result) {
      if(result.affectedRows != 1)
        throw new IncorrectLoginException(); // Errore durante l'inserimento del token nel database
      return true;
    });
  },

  getUserInfo: getUserInfo,

  getFilter: function(filterName, user) {
    // filterName = "ricerca2"; // Ricerca di test
    // user = new User("test", null, null, null); // Utente di test
    const sqlGetFilter = 'SELECT r.NomeRicerca, r.DislivelloMassimo, r.LunghezzaMassima, r.DurataMassima, l.Denominazione, d.Valore, p.Stagione FROM ricerca r, localita l, difficolta d, periodo p WHERE r.IDUtente = (SELECT u.ID FROM utenti u WHERE u.username=' + database.escape(user.username) + ') AND r.NomeRicerca=' + database.escape(filterName) + ' AND d.ID=r.Difficolta AND p.ID=r.Periodo;';
    return executeQuery(sqlGetFilter).then(function OnGetFilter(filter) {
      if(filter.length != 1)
        throw new NotExistingFilterException();
      return new Filter(filter[0].NomeRicerca, filter[0].DislivelloMassimo, filter[0].LunghezzaMassima, filter[0].DurataMassima, filter[0].Difficolta, filter[0].Localita, filter[0].Periodo);
    });
  }
}

function getUserInfo(loginToken) {
  // loginToken = "aaaaaaaabbbbbbbbccccccccdddddddd"; // Token di test
  let userId;
  let userName;
  let lastRoute;
  let savedRoutes = [];
  let savedFilters = [];
  const sqlGetUserIdAndLastRoute = 'SELECT u.ID, u.username, u.UltimoPercorsoRicercato FROM utenti u INNER JOIN login l ON l.userId=u.ID AND l.logintoken=' + database.escape(loginToken) + ';';
  return executeQuery(sqlGetUserIdAndLastRoute).then(function OnGetUserIdAndLastRoute(dbUserIdAndLastRoute) {
    if(dbUserIdAndLastRoute == null)
      throw new IncorrectLoginException();
    userId = dbUserIdAndLastRoute[0].ID;
    userName = dbUserIdAndLastRoute[0].username;
    lastRoute = dbUserIdAndLastRoute[0].UltimoPercorsoRicercato;
    const sqlGetSavedRoutes = 'SELECT p.ID, p.Nome, p.DataInizio, p.Durata, p.Lunghezza, p.Dislivello, p.Difficolta, p.Localita, p.Descrizione FROM percorso p WHERE p.ID IN (SELECT ip.IDPercorso FROM itinerariopreferito ip WHERE ip.IDUtente=' + database.escape(userId) + ');';
    return executeQuery(sqlGetSavedRoutes);
  }).then(function OnGetSavedRoutesIds(savedRoutesDb) {
    savedRoutesDb.forEach(function(item, index) {
      savedRoutes.push(new RouteDetail(item.ID, item.Nome, item.DataInizio, item.Durata, item.Lunghezza, item.Dislivello, item.Difficolta, item.Localita, item.Descrizione, item.URL, item.MapURL, item.TrackURL));
    });
    const sqlGetSavedFilters = 'SELECT r.NomeRicerca, r.DislivelloMassimo, r.LunghezzaMassima, r.DurataMassima, r.Difficolta, r.Localita, r.Periodo FROM ricerca r WHERE r.IDUtente=' + database.escape(userId) + ';';
    return executeQuery(sqlGetSavedFilters);
  }).then(function OnGetSavedFilters(savedFiltersDb) {
    savedFiltersDb.forEach(function(item, index) {
      savedFilters.push(new Filter(item.NomeRicerca, item.DislivelloMassimo, item.LunghezzaMassima, item.DurataMassima, item.Difficolta, item.Localita, item.Periodo));
    });
    return new User(userName, lastRoute, savedRoutes, savedFilters);
  });
}

// Metodo di utilità per eseguire una query sul database. Restituisce un array contenente i risultati
function executeQuery(querySQL) {
  return new Promise((resolve, reject) => {
    const dbconnection = database.createConnection(config.dbConnection);
    dbconnection.connect();
    dbconnection.query(querySQL, function(err, rows, fields) {
      if(err != null) {
          console.log(err);
          throw new FailedDatabaseQueryException();
      }
      dbconnection.end();
      resolve(rows);
    });
  });
}

function signin(userLogin) {
  // userLogin = new UserLogin("test", "prova", "prova"); // Utente di test
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
