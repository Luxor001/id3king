const Hapi = require('hapi');
const cron = require('cron');
const Inert = require('inert');
//carica tutte le routes di routes.js
var controller = require('./backend/controller');
const config = require('./backend/config');

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

server.connection(config.serverConnection);

server.register([Inert]);

server.start((err) => {
  if (err)
    throw err;
  console.log('Server avviato su:', server.info.uri);
});
server.route(controller);
