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
    handler: function(request, reply) {
      let result = new GetDataResult();
      dbHandler.getRoutes().then(function(routesResults) {
        result.routes = routesResults;
        result.Return = true;
        reply(result);
      }, function onFail(Exception) {
        if(Exception instanceof EmptyDatabaseException)
          reply(result.setError(LoginResultERRORS.EMPTY_DATABASE));
        else
          reply(result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR));
      });
    }
  },

  /// API per ottenere i dettagli di una certa route
  {
    method: 'POST',
    path: '/api/getRouteDetails',
    handler: function(request, reply) {
      let result = new GetDataResult();
      dbHandler.getRouteDetails(request.payload.routeId).then(function(routeDetails) {
        result.routes = routeDetails;
        result.Return = true;
        reply(result);
      }, function onFail(Exception) {
        if(Exception instanceof RouteNotFoundException)
          reply(result.setError(LoginResultERRORS.ROUTE_NOT_FOUND));
        else
          reply(result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR));
      });
    }
  },

  /// API per salvare tra i preferiti la route corrente
  {
    method: 'POST',
    path: '/api/saveRoute',
    handler: function(request, reply) {
      let result = new BaseResult();
      dbHandler.saveRoute(request.payload.routeId).then(function(boolean) {
        result.Return = true;
      }, function onFail(Exception) {
        if(Exception instanceof IncorrectLoginException)
          reply(result.setError(LoginResultERRORS.INCORRECT_LOGIN));
        else if(Exception instanceof AlreadySavedRouteException)
          reply(result.setError(LoginResultERRORS.ALREADY_SAVED_ROUTE));
        else
          reply(result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR));
      });
    }
  },

  /// API per effettuare la login utente
  /// cercare come fare per https://hapijs.com/tutorials/auth
  {
    method: 'POST',
    path: '/api/signin',
    handler: function(request, reply) {
      var result = new LoginResult();
      dbHandler.signin(request.payload.userLogin).then(function(loginToken) {
        result.Return = true;
        result.loginToken = loginToken;
        result.user = dbHandler.getUserInfo(request.payload.userLogin);
        reply(result);
      }, function onFail(Exception) {
        if (Exception instanceof IncorrectLoginException)
          reply(result.setError(LoginResultERRORS.INCORRECT_LOGIN));
        else
          reply(result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR));
      })
    }
  },

  /// API per registrare un utente
  {
    method: 'POST',
    path: '/api/signup',
    handler: function(request, reply) {
      let result = new LoginResult();
      dbHandler.signup(request.payload.userLogin).then(function onSuccess(loginToken) {
        result.Return = true;
        result.loginToken = loginToken;
        result.user = dbHandler.getUserInfo(request.payload.userLogin);
        reply(result);
      }, function onFail(Exception) {
        if (Exception instanceof IncorrectPasswordLengthException)
          reply(result.setError(LoginResultERRORS.PASSWORD_MIN_LENGTH));
        else if (Exception instanceof PasswordsNotEqualsException)
          reply(result.setError(LoginResultERRORS.PASSWORD_NOT_MATCHING));
        else if (Exception instanceof UsernameAlreadyExistException)
          reply(result.setError(LoginResultERRORS.USER_ALREADY_EXIST));
        else if (Exception instanceof IncorrectLoginException)
          reply(result.setError(LoginResultERRORS.INCORRECT_LOGIN));
        else
          reply(result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR));
      });
    }
  },

  /// API per registrare un utente
  {
    method: 'POST',
    path: '/api/getBookmarkedRoutes',
    handler: function(request, reply) {
      let result = new GetDataResult();
      dbHandler.getUserInfo(request.payload.loginToken).then(function onSuccess(userInfo) {
        result.Return = true;
        result.routes = userInfo.savedRoutes;
        reply(result);
      }, function onFail(Exception) {
        if (Exception instanceof IncorrectLoginException)
          reply(result.setError(LoginResultERRORS.INCORRECT_LOGIN));
        else
          reply(result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR));
      });
    }
  },

  /// API per salvare i filtri su DB
  {
    method: 'POST',
    path: '/api/saveFilter',
    handler: function(request, reply) {
      let result = new BaseResult();
      dbHandler.getUserInfo(request.payload.loginToken).then(function onSuccess(user) {
        dbHandler.saveFilter(request.payload.filter, user).then(function() {
          result.Return = true;
          reply(result);
        });
      }, function onFail(Exception) {
        if (Exception instanceof IncorrectLoginException)
          reply(result.setError(LoginResultERRORS.INCORRECT_LOGIN));
        else if (Exception instanceof AlreadyExistingFilterException)
          reply(result.setError(LoginResultERRORS.ALREADY_EXISTING_FILTER));
        else
          reply(result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR));
      });
    }
  },

  /// API per salvare i filtri su DB
  {
    method: 'POST',
    path: '/api/getFilter',
    handler: function(request, reply) {
      let result = new BaseResult();
      dbHandler.getUserInfo(request.payload.loginToken).then(function onSuccess(user) {
        dbHandler.getFilter(request.payload.filterName, user).then(function(filter) {
          result.Return = true;
          result.filter = filter;
          reply(result);
        });
      }, function onFail(Exception) {
        if(Exception instanceof NotExistingFilterException)
          reply(result.setError(LoginResultERRORS.NOT_EXISTING_FILTER));
        else
          reply(result.setError(LoginResultERRORS.GENERIC_UNHANDLED_ERROR));
      });
    }
  },

  {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true,
        index: true
      }
    }
  },

  /// API di debug che esegue lo scraping incondizionatamente
  {
    method: 'GET',
    path: '/debugScraper',
    handler: function(request, reply) {
      let result = new GetDataResult();
      scraper.scanSite().then(function(scrapeResults) {
        if (scrapeResults != null) {
          result.routes = scrapeResults;
          result.Return = true; // segnaliamo al client che è andato tutto come previsto
          dbHandler.saveScrapeResults(scrapeResults);
        }
        reply(result);
      }, function onFail(Exception) {
        reply(result.setError(LoginResultERRORS.DATABASE_SCRAPING_ERROR));
      });
    }
  }
];
