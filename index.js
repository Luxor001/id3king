const Hapi = require('hapi');
const cron = require('cron');
const Inert = require('inert');
const controller = require('./backend/controller');
const config = require('./backend/config');
const Path = require('path');
const fs = require('fs');

try { // Impostazioni di TLS (opzionali)
  config.serverConnection.tls = {
    key: fs.readFileSync(config.security.tlsPrivateKeyPath),
    cert: fs.readFileSync(config.security.tlsCertificatePath)
  }
  console.log("INFO: Certificato e chiave privata caricati correttamente.");
} catch (ex) {
  console.log("INFO: File della chiave privata e/o del certificato non trovato/i.")
}

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
  try { // Cron
    cron.job(config.scraper.cronFrequency, function() {
      console.log("INFO: Performing scraping with cron.");
      controller.performScraping();
    }).start();
  } catch (ex) {
    console.log("WARNING: Errore di sintassi nella specifica cron.");
  }
  if(config.scraper.forceScrapingOnStartup) { // Forced scraping
    console.log("INFO: Performing forced scraping.");
    controller.performScraping();
  }
}
startServer();
console.log('Server avviato su:', server.info.uri);
