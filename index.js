const Hapi = require('hapi');
const cron = require('cron');
const Inert = require('inert');
//carica tutte le routes di routes.js
var controller = require('./backend/controller');
let authConfig = require('./backend/auth/authConfig')

const Path = require('path');
const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'app')
      }
    }
  }
});

server.connection({
  port: 8081,
  routes: {
    cors: true
  }
});

var opts = { fields:authConfig.fields, handler:authConfig.handlerFunct, loginPath:'/login' }; // the fields and handler defined above
server.register([Inert, { register: require('hapi-login'), options:opts }], function (err) {
  if (err) { console.error('Failed to load plugin:', err); }
});

server.start((err) => {
  if (err)
    throw err;
  console.log('Server avviato su:', server.info.uri);
});
server.route(controller);
