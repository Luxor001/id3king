let Joi = require('joi');
const dbHandler = require('../dbHandler/dbHandler.js');

module.exports = {
  fields: {
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6)
  },
  handlerFunct: function(request, reply) {
    debugger;
    dbHandler.login(request.payload.username, request.payload.password).then(function onSuccess(authenticationToken) {
      debugger;
      reply('great success'); // or what ever you want to rply
      // reply(authenticationToken)
    }, function onFail() {
      reply(Boom.notFound('Sorry, that username or password is invalid, please try again.'));
    })
  }
}
