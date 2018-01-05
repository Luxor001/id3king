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
  DatabaseScrapingException,
} = require('./dbHandler/dbHandlerExceptions.js');
const BaseResult = require('./code/BaseResult.js');
const User = require('./code/User.js');
const dbHandler = require('./dbHandler/dbHandler.js');
const scraper = require('./scraper/scraper.js');

class GetDataResult extends BaseResult {
  constructor() {
    super();
    this.routes = [];
  }
}

class LoginResult extends BaseResult {
  constructor(loginToken, userInfo) {
    super();
    this.loginToken = loginToken;
    this.user = userInfo;
  }
}

const LoginResultERRORS = {
  INCORRECT_PASSWORD_LENGTH: 'INCORRECT_PASSWORD_LENGTH',
  PASSWORD_NOT_MATCHING: 'PASSWORD_NOT_MATCHING',
  USER_ALREADY_EXIST: 'USER_ALREADY_EXIST',
  INCORRECT_LOGIN: 'INCORRECT_LOGIN',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  ALREADY_SAVED_ROUTE: 'ALREADY_SAVED ROUTE',
  ALREADY_EXISTING_FILTER: 'ALREADY_EXISTING_FILTER',
  NOT_EXISTING_FILTER: 'NOT_EXISTING_FILTER',
  FAILED_DATABASE_QUERY: 'FAILED_DATABASE_QUERY',
  EMPTY_DATABASE: 'EMPTY_DATABASE',
  GENERIC_UNHANDLED_ERROR: 'GENERIC_UNHANDLED_ERROR',
  DATABASE_SCRAPING_ERROR: 'DATABASE_SCRAPING_ERROR'
}

module.exports = [

  /// API per ottenere tutte le routes del DB
  {
    method: 'GET',
    path: '/api/getRoutes',
    handler: function(request) {
      let result = new GetDataResult();
      return dbHandler.getRoutes().then(function(routesResults) {
        result.routes = routesResults;
        result.Return = true;
        return result;
      }, function onFail(Exception) {
        if(Exception instanceof EmptyDatabaseException)
          return result.setError(LoginResultERRORS.EMPTY_DATABASE);
        else
          return result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR);
      });
    }
  },

  /// API per ottenere i dettagli di una certa route
  {
    method: 'POST',
    path: '/api/getRouteDetails',
    handler: function(request) {
      let result = new GetDataResult();
      return dbHandler.getRouteDetails(request.payload.routeId).then(function(routeDetails) {
        result.routes = routeDetails;
        result.Return = true;
        return result;
      }, function onFail(Exception) {
        if(Exception instanceof RouteNotFoundException)
          return result.setError(LoginResultERRORS.ROUTE_NOT_FOUND);
        else
          return result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR);
      });
    }
  },

  /// API per salvare tra i preferiti la route corrente
  {
    method: 'POST',
    path: '/api/saveRoute',
    handler: function(request) {
      let result = new BaseResult();
      return dbHandler.saveRoute(request.payload.routeId).then(function(boolean) {
        result.Return = true;
        return result;
      }, function onFail(Exception) {
        if(Exception instanceof IncorrectLoginException)
          return result.setError(LoginResultERRORS.INCORRECT_LOGIN);
        else if(Exception instanceof AlreadySavedRouteException)
          return result.setError(LoginResultERRORS.ALREADY_SAVED_ROUTE);
        else
          return result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR);
      });
    }
  },

  /// API per effettuare la login utente
  /// cercare come fare per https://hapijs.com/tutorials/auth
  {
    method: 'POST',
    path: '/api/signin',
    handler: function(request) {
      var result = new LoginResult();
      return dbHandler.signin(request.payload.userLogin).then(function(loginToken) {
        result.Return = true;
        result.loginToken = loginToken;
        return dbHandler.getUserInfo(loginToken).then(function(userInfo){
          result.user = userInfo;
          return result;
        });
      }, function onFail(Exception) {
        if (Exception instanceof IncorrectLoginException)
          return result.setError(LoginResultERRORS.INCORRECT_LOGIN);
        else
          return result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR);
      })
    }
  },

  /// API per registrare un utente
  {
    method: 'POST',
    path: '/api/signup',
    handler: function(request) {
      let result = new LoginResult();
      return dbHandler.signup(request.payload.userLogin).then(function onSuccess(loginToken) {
        result.Return = true;
        result.loginToken = loginToken;
        result.user = dbHandler.getUserInfo(request.payload.userLogin);
        return result;
      }, function onFail(Exception) {
        if (Exception instanceof IncorrectPasswordLengthException)
          return result.setError(LoginResultERRORS.PASSWORD_MIN_LENGTH);
        else if (Exception instanceof PasswordsNotEqualsException)
          return result.setError(LoginResultERRORS.PASSWORD_NOT_MATCHING);
        else if (Exception instanceof UsernameAlreadyExistException)
          return result.setError(LoginResultERRORS.USER_ALREADY_EXIST);
        else if (Exception instanceof IncorrectLoginException)
          return result.setError(LoginResultERRORS.INCORRECT_LOGIN);
        else
          return result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR);
      });
    }
  },

  /// API per registrare un utente
  {
    method: 'POST',
    path: '/api/getBookmarkedRoutes',
    handler: function(request) {
      let result = new GetDataResult();
      return dbHandler.getUserInfo(request.payload.loginToken).then(function onSuccess(userInfo) {
        result.Return = true;
        result.routes = userInfo.savedRoutes;
        return result;
      }, function onFail(Exception) {
        if (Exception instanceof IncorrectLoginException)
          return result.setError(LoginResultERRORS.INCORRECT_LOGIN);
        else
          return result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR);
      });
    }
  },

  /// API per salvare i filtri su DB
  {
    method: 'POST',
    path: '/api/saveFilter',
    handler: function(request) {
      let result = new BaseResult();
      return dbHandler.getUserInfo(request.payload.loginToken).then(function onSuccess(user) {
        return dbHandler.saveFilter(request.payload.filter, user).then(function() {
          result.Return = true;
          return result;
        });
      }, function onFail(Exception) {
        if (Exception instanceof IncorrectLoginException)
          return result.setError(LoginResultERRORS.INCORRECT_LOGIN);
        else if (Exception instanceof AlreadyExistingFilterException)
          return result.setError(LoginResultERRORS.ALREADY_EXISTING_FILTER);
        else
         return result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR);
      });
    }
  },

  /// API per salvare i filtri su DB
  {
    method: 'POST',
    path: '/api/getFilter',
    handler: function(request) {
      let result = new BaseResult();
      return dbHandler.getUserInfo(request.payload.loginToken).then(function onSuccess(user) {
        return dbHandler.getFilter(request.payload.filterName, user).then(function(filter) {
          result.Return = true;
          result.filter = filter;
          return result;
        });
      }, function onFail(Exception) {
        if(Exception instanceof NotExistingFilterException)
          return result.setError(LoginResultERRORS.NOT_EXISTING_FILTER);
        else
          return result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR);
      });
    }
  },

  /// API di debug che esegue lo scraping incondizionatamente
  {
    method: 'GET',
    path: '/debugScraper',
    handler: function(request) {
      let result = new GetDataResult();
      return scraper.scanSite().then(function(scrapeResults) {
        if (scrapeResults != null) {
          result.routes = scrapeResults;
          result.Return = true; // segnaliamo al client che è andato tutto come previsto
          //dbHandler.saveScrapeResults(scrapeResults);
        }
        return result;
      }, function(error){
        debugger;
        console.log(error);
      });
    }
  }
];
