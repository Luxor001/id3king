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
  FailedDatabaseQueryException,
  EmptyDatabaseException,
  DatabaseScrapingException
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
    const sql = 'SELECT p.ID,p.Nome,p.DataInizio,p.Durata,p.Lunghezza,p.Dislivello,d.Valore,l.Denominazione,Descrizione FROM Percorso p INNER JOIN difficolta d ON p.Difficolta=d.ID INNER JOIN localita l ON p.Localita=l.ID ORDER BY ID;';
    return executeQuery(sql).then(function(routesResults) {
      if (routesResults == null)
        throw new EmptyDatabaseException();
      routesResults.forEach(function(item, index) {
        results.push(new Route(item.ID, item.Nome, item.DataInizio, item.Durata, item.Lunghezza, item.Dislivello, item.Valore, item.Denominazione, item.Descrizione));
      });
      return results;
    });
  },

  getRouteDetails: function(routeId) {
    // Ottenimento dei dettagli su uno specifico percorso
    // routeId = 2017; // Percorso di test
    let results;
    const sql = 'SELECT p.ID,p.Nome,p.DataInizio,p.Durata,p.Lunghezza,p.Dislivello,d.Valore,l.Denominazione,p.Descrizione,p.URL,p.MapURL,p.TrackURL,p.ContatoreAccessi FROM Percorso p INNER JOIN difficolta d ON d.ID=p.Difficolta INNER JOIN localita l ON l.ID=p.Localita WHERE p.ID=' + database.escape(routeId) + ' AND d.ID=p.Difficolta;';
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
      var saltRounds = Math.floor(Math.random()*10)+1;
      return Bcrypt.hash(userLogin.password, saltRounds);
    }).then(function OnHashedPassword(hashedPassword) {
      // Salvare nel database il nuovo utente
      const sqlAddUser = 'INSERT INTO `id3king`.`utenti` (`username`, `password`) VALUES (' + database.escape(userLogin.username) + ', ' + database.escape(hashedPassword) + ');';
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
  },

  saveScrapeResults: function(scrapeResultsRoutes) {
    let maxIDLocalita;
    let maxIDPercorso;
    return executeQuery('SELECT MAX(p.ID) AS MaxIdPercorso, MAX(l.ID) AS MaxIdLocalita FROM Percorso p, Localita l;').then(function(maxIdResults) {
      maxIDLocalita = maxIdResults[0].MaxIdLocalita;
      maxIDPercorso = maxIdResults[0].MaxIdPercorso;
      // Inserimento delle località
      if(maxIDLocalita == null) // Caso base in cui il database è vuoto
        maxIDLocalita = 0;
      for(i=maxIDLocalita+1; i<scrapeResultsRoutes.localita.length; i++) {
        let sqlInsertLocalita = 'INSERT INTO `id3king`.`localita` (`ID`, `Denominazione`) VALUES (?, ?);';
        const inserts = [scrapeResultsRoutes.localita[i].id, scrapeResultsRoutes.localita[i].nome];
        sqlInsertLocalita = database.format(sqlInsertLocalita, inserts);
        executeQuery(sqlInsertLocalita);
      }
    }).then(function() {
      // Inserimento dei percorsi
      if(maxIDPercorso == null) // Caso base in cui il database è vuoto
        maxIDPercorso = 1;
      for(i=maxIDPercorso; i<Object.keys(scrapeResultsRoutes.itinerari).length; i++) {
        const dateToArray = scrapeResultsRoutes.itinerari[i].data.split('/');
        dateToArray[0] = parseInt(dateToArray[0]); // Le date non normalizzate sono approssimate
        dateToArray[1] = parseInt(dateToArray[1])-1;
        dateToArray[2] = parseInt(dateToArray[2]);
        const dateToSqlFormat = new Date(Date.UTC(dateToArray[2], dateToArray[1], dateToArray[0])).toISOString().slice(0,19).replace('T', ' ');
        const mapURL = scrapeResultsRoutes.itinerari[i].link.replace("indice", "zona");
        var difficoltaID = scrapeResultsRoutes.itinerari[i].difficolta; // Conversione da valore difficoltà al relativo ID del database
        if(difficoltaID=='T') difficoltaID = 1;
        else if(difficoltaID=='E') difficoltaID = 2;
        else if(difficoltaID=='EE') difficoltaID = 3;
        else if(difficoltaID=='EEA') difficoltaID = 4;
        else if(difficoltaID=='EAI') difficoltaID = 5;
        else difficoltaID = "NULL";
        let sqlInsertString = "INSERT INTO `id3king`.`percorso` (`ID`, `Nome`, `DataInizio`, `URL`, `Durata`, `Lunghezza`, `Dislivello`, `TrackURL`, `MapURL`,  `Difficolta`, `Localita`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
        const inserts = [scrapeResultsRoutes.itinerari[i].id, scrapeResultsRoutes.itinerari[i].descrizione, dateToSqlFormat, scrapeResultsRoutes.itinerari[i].link, scrapeResultsRoutes.itinerari[i].durata, scrapeResultsRoutes.itinerari[i].lunghezza, scrapeResultsRoutes.itinerari[i].dislivello, scrapeResultsRoutes.itinerari[i].trackUrl, mapURL, difficoltaID, scrapeResultsRoutes.itinerari[i].IDlocalita];
        sqlInsertString = database.format(sqlInsertString, inserts);
        executeQuery(sqlInsertString);
      }
      // TODO inserire toponimi secondari
      return true;
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
  const sqlGetUserIdAndLastRoute = `SELECT u.ID, u.username, u.UltimoPercorsoRicercato
                                    FROM utenti u
                                    INNER JOIN login l ON l.userId=u.ID
                                    WHERE l.logintoken=`+ database.escape(loginToken);
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
  let dbUserId;
  const sqlGetPassword = 'SELECT ID,password FROM utenti WHERE username=' + database.escape(userLogin.username) + ';'; // Ricavare la password dell'utente in base all'username fornito
  return executeQuery(sqlGetPassword).then(function(dbCredentials) {
    if(dbCredentials == null)
      throw new IncorrectLoginException(); // L'utente non esiste
    dbUserId = dbCredentials[0].ID;
    return Bcrypt.compare(userLogin.password, dbCredentials[0].password);
  }).then(function OnComparePassword(compareResult) {
    if (!compareResult)
      throw new IncorrectLoginException(); // La password inserita non coincide con quella nel database
    // Se il login ha avuto successo, generare un token, salvarlo sul database e restituirlo al client
    let loginToken = randtoken.generate(32);
    var insertSql = 'INSERT INTO Login (`userId`, `logintoken`) VALUES (?, ?);';
    var insertsInsert = [dbUserId, loginToken];
    insertSql = database.format(insertSql, insertsInsert);
    return executeQuery(insertSql).then(function(result) {
      if(result.affectedRows != 1)
        throw new IncorrectLoginException(); // Errore durante l'inserimento del token nel database
      return loginToken;
    });
  });
}
