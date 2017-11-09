const {
  IncorrectPasswordLengthException,
  PasswordsNotEqualsException,
  UsernameAlreadyExistException
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
  USER_ALREADY_EXIST: 'USER_ALREADY_EXIST'
}

module.exports = [

  /// API per l'ottenimento di tutti gli itinerari da DB
  {
    method: 'POST',
    path: '/getData',
    handler: function(request, reply) {
      var result = new GetDataResult();

      var routes = dbHandler.getRoutes();
      if (routes != null) { // se il db non è vuoto e inizializzato (ovviamente da migliorare)..
        result.routes = routes;
        result.Return = true; // segnaliamo al client che è andato tutto come previsto
      }
      reply(routes); // response della chiamata HTTP POST
    }
  },

  /// API per ottenere tutte le routes del DB
  {
    method: 'GET',
    path: '/getRoutes',
    handler: function(request, reply) {
      var routes = dbHandler.getRoutes();
      reply(routes);
    }
  },

  /// API per ottenere i dettagli di una certa route
  {
    method: 'POST',
    path: '/getRouteDetails',
    handler: function(request, reply) {
      let routeDetail = dbHandler.getRouteDetails(request.payload.routeId);
      reply(routeDetail);
    }
  },

  /// API per salvare tra i preferiti la route corrente
  {
    method: 'POST',
    path: '/saveRoute',
    handler: function(request, reply) {
      let result = dbHandler.saveRoute(request.payload.routeId);
      reply(result);
    }
  },

  /// API per effettuare la login utente
  /// cercare come fare per https://hapijs.com/tutorials/auth
  {
    method: 'POST',
    path: '/signin',
    handler: function(request, reply) {
      var result = new LoginResult();

      dbHandler.signin(request.payload.userLogin).then(function(loginToken) {
        result.Return = true;
        result.loginToken = loginToken;
        result.user = dbHandler.getUserInfo(request.payload.userLogin);
        reply(result);
      }, function onFail(Exception) {
        if (Exception instanceof PasswordsNotEqualsException)
          reply(result.setError(LoginResultERRORS.PASSWORD_NOT_MATCHING));
      })
    }
  },

  /// API per registrare un utente
  {
    method: 'POST',
    path: '/signup',
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

  /// API per salvare i filtri su DB
  {
    method: 'POST',
    path: '/savefilters',
    handler: function(request, reply) {
      var filtri = request.payload.filtri;
      filtri.forEach(filtro => {
        // save filtro to DB
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
