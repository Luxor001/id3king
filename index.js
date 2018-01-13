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
  console.log("WARNING: File della chiave privata e/o del certificato non trovato/i. TLS non verrà utilizzato.")
}

const server = new Hapi.Server(config.serverConnection);
server.connections = {
  routes: {
    files: {
      relativeTo: Path.join(__dirname, 'app')
    }
  }
};

async function startServer(){
  await server.register(Inert);
  server.route(controller.apis);
  await server.start();
  if(config.scraper.cronEnabled) {
    try { // Cron
      cron.job(config.scraper.cronFrequency, function() {
        console.log("INFO: Esecuzione scraping con cron.");
        controller.performScraping();
      }).start();
    } catch (ex) {
      console.log("WARNING: Errore di sintassi nella specifica cron.");
    }
  }
  if(config.scraper.forceScrapingOnStartup) { // Forced scraping
    console.log("INFO: Esecuzione scraping forzata.");
    controller.performScraping();
  }
}
startServer();
console.log('INFO: Server avviato su:', server.info.uri);
