const Hapi = require('hapi');
const cron = require('cron');
const Inert = require('inert');
//carica tutte le routes di routes.js
var controller = require('./backend/controller');
const config = require('./backend/config');

const Path = require('path');
const server = new Hapi.Server(config.serverConnection);
server.connections = {
  routes: {
    files: {
      relativeTo: Path.join(__dirname, 'app')
    }
  }
};

server.route(controller);
async function startServer(){
  await server.register(Inert);
  await server.start();
}
startServer();
console.log('Server avviato su:', server.info.uri);

