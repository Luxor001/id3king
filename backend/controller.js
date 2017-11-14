const {
  IncorrectPasswordLengthException,
  PasswordsNotEqualsException,
  UsernameAlreadyExistException,
  IncorrectLoginException
} = require('./dbHandler/dbHandlerExceptions.js');
const BaseResult = require('./code/BaseResult.js');
const User = require('./code/User.js');
const dbHandler = require('./dbHandler/dbHandler.js');

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
  INCORRECT_LOGIN: 'INCORRECT_LOGIN'
}

module.exports = [

  /// API per ottenere tutte le routes del DB
  {
    method: 'GET',
    path: '/api/getRoutes',
    handler: function(request, reply) {
      var result = new GetDataResult();

      var routes = dbHandler.getRoutes();
      if (routes != null) { // se il db non è vuoto e inizializzato (ovviamente da migliorare)..
        result.routes = routes;
        result.Return = true; // segnaliamo al client che è andato tutto come previsto
      }
      reply(result);
    }
  },

  /// API per ottenere i dettagli di una certa route
  {
    method: 'POST',
    path: '/api/getRouteDetails',
    handler: function(request, reply) {
      let routeDetail = dbHandler.getRouteDetails(request.payload.routeId);
      reply(routeDetail);
    }
  },

  /// API per salvare tra i preferiti la route corrente
  {
    method: 'POST',
    path: '/api/saveRoute',
    handler: function(request, reply) {
      let result = dbHandler.saveRoute(request.payload.routeId);
      reply(result);
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
        if (Exception instanceof PasswordsNotEqualsException)
          reply(result.setError(LoginResultERRORS.PASSWORD_NOT_MATCHING));
        if (Exception instanceof UsernameAlreadyExistException)
          reply(result.setError(LoginResultERRORS.USER_ALREADY_EXIST));
      });
    }
  },

  /// API per registrare un utente
  {
    method: 'POST',
    path: '/api/getBookmarkedRoutes',
    handler: function(request, reply) {
      let result = new GetDataResult();
      dbHandler.checkToken(request.payload.loginToken).then(function onSuccess(userInfo) {
        result.Return = true;
        result.routes = userInfo.savedRoutes;
        reply(result);
      }, function onFail(Exception) {
        if (Exception instanceof IncorrectLoginException)
          return; // non ritornare nulla: è più sicuro se l'utente non sa il perché la richiesta è fallita
      });
    }
  },

  /// API per salvare i filtri su DB
  {
    method: 'POST',
    path: '/api/saveFilter',
    handler: function(request, reply) {
      let result = new BaseResult();
      dbHandler.checkToken(request.payload.loginToken).then(function onSuccess(user) {
        dbHandler.saveFilter(request.payload.filter, user).then(function() {
          result.Return = true;
          reply(result);
        });
      }, function onFail(Exception) {
        //TODO: da sistemare l'eccezione...
        //if (Exception instanceof FilterNameAlreadyExistException)

      });
    }
  },

  /// API per salvare i filtri su DB
  {
    method: 'POST',
    path: '/api/getFilter',
    handler: function(request, reply) {
      let result = new BaseResult();
      dbHandler.checkToken(request.payload.loginToken).then(function onSuccess(user) {
        dbHandler.getFilter(request.payload.filterName, user).then(function(filter) {
          result.Return = true;
          result.filter = filter;
          reply(result);
        });
      }, function onFail(Exception) {
        //TODO: da sistemare questo error handling? In teoria non dovrebbe mai fallire la ricerca di un filtro.
        return;
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
  }
];
