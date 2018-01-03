// Tutta la logca di scraping del sito
const cheerio = require('cheerio');
const request = require('request-promise');
const siteBaseAddress = "http://www.id3king.it/"

module.exports = {
  scanSite: function() {
    return scrape();
  },
}

function scrape() {
  let scrapingItinerari = [];

  // Ottenimento di tutte le informazioni base degli itinerari (ITINERARIO)
  return request(siteBaseAddress + 'Itinerari%20Frame/titolo.htm').then(function(result, error) {
    let $ = cheerio.load(result);
    let links = $('a');
    for (var i = 0; i < links.length; i++) {
      let linkToDate = $(links.eq(i)).attr('href');
      let scrapingItinerariAnno = request(siteBaseAddress + 'Itinerari%20Frame/' + linkToDate).then(function(result, error) {
        let itinerariAnno = {};
        var righe = cheerio.load(result)('tr');
        for (let j = 0; j < righe.length; j++) {
          var colonneRiga = righe.eq(j).children('td');
          var newItinerario = {};
          newItinerario.id = parseInt(colonneRiga.eq(0).text().replace(/\W/g, ''));
          newItinerario.link = siteBaseAddress + colonneRiga.eq(0).find('a').attr('href');
          newItinerario.descrizione = colonneRiga.eq(2).text().replace(/\s\s+/g, ' ').substr(1);
          //var data = colonneRiga.eq(1).text().replace(/[^\d\/]/g, '').split('/');
          var data = colonneRiga.eq(1).text().split('/');
          data[0] = data[0].slice(8);
          data[2] = parseInt(data[2]) < 70 ? '20' + data[2] : '19' + data[2]; // Gestione degli anni indicati abbreviati con due cifre, dal 1970 in poi.
          newItinerario.data = data[0] + '/' + data[1] + '/' + data[2];
          var durata = colonneRiga.eq(3).text().replace(/(\s\s+)*[ ']+/g, '');
          var ore = parseInt(durata.split("h")[0]);
          var minuti = parseInt(durata.split("h")[1]);
          newItinerario.durata = ore * 60 + minuti;
          var lunghezza = colonneRiga.eq(5).text().replace(/\s\s+/g, ' ').replace(/[ ]/g, '');
          var isKm = lunghezza.toLowerCase().includes('km');
          lunghezza = parseInt(lunghezza.replace(/\D/g, ""));
          newItinerario.lunghezza = isKm ? lunghezza * 1000 : lunghezza;
          newItinerario.difficolta = colonneRiga.eq(4).text().replace(/\s\s+/g, '');
          newItinerario.dislivello = colonneRiga.eq(6).text().replace(/\s\s+/g, ' ').replace(/[Dh+ m]/g, '');
          itinerariAnno[newItinerario.id] = newItinerario;
        }
        return itinerariAnno;
      });
      scrapingItinerari.push(scrapingItinerariAnno);
    }

    // attendiamo il completamento di tutte le promises di scraping degli itinerari...
    return Promise.all(scrapingItinerari);
  }).then(function onScrapingItinerariEnd(itinerariAnni) {

    // costruiamo un dictionary di itinerari ottenuti
    let itinerari = itinerariAnni.reduce((itinerari, itinerariAnnoCorrente) => Object.assign(itinerari, itinerariAnnoCorrente), {});

    // Ottenimento toponimi principali (LOCALITA)
    return request(siteBaseAddress + 'toponimi2.htm').then(function(result, error) {
      let localita = [];
      let righe = cheerio.load(result)('tr');
      for (var i = 0; i < righe.length; i++) {
        var colonneRiga = righe.eq(i).children('td');
        var newLocalita = {};
        newLocalita.id = i;
        newLocalita.nome = colonneRiga.eq(0).text().replace(/\s\s+/g, ' ').substr(1);
        var itinerariCollegati = colonneRiga.eq(1).text().replace(/\s\s+/g, ' ').replace(/[,]/g, '');
        itinerariCollegati = itinerariCollegati.split(' ').map(value => parseInt(value)).filter(value => !isNaN(value));
        itinerariCollegati.forEach(idItinerario => itinerari[idItinerario].IDlocalita = newLocalita.id);
        localita.push(newLocalita);
      }
      return {
        itinerari: itinerari,
        localita: localita
      };
    });
  }).then(function onScrapingEnd(allPromisesResult) {
    // Qui possiamo eventualmente rifinire i dati che abbiamo raccolto da tutti gli scraping...
    return allPromisesResult;
  });
};

// Ottenimento toponimi secondari (LUOGHI)
// PER ORA NON NECESSARIO, LASCIO IL CODICE DI SCRAPING (che funziona, va solo controllato e i dati effettivamente usati)
/*  let promiseToponimiSecondari = request(siteBaseAddress + 'TopGen/alfabeto.htm', function(err, response, result) {
    let promises = [];
    let luoghi = {};
    let links = cheerio.load(result)('a');
    for (let i = 0; i < links.length; i++) {
      let link = $(links.eq(i)).attr('href'); // Ottieni tutti i link delle lettere
      let promise = request(siteBaseAddress + 'Itinerari%20Frame/TopGen/' + link, function(err, response, result) {
        let righe = cheerio.load(result)('tr'); //parsing della singola lettera
        for (let j = 0; j < righe.length; j++) {
          var colonneRiga = righe.eq(j).children('td');
          let nome = colonneRiga.eq(1).text().replace(/\s\s+/g, ' ');
          luoghi[nome] = luoghi[nome] == null ? {
            itinerariCollegati: []
          } : luoghi[nome];
          let itinerariCollegati = colonneRiga.eq(2).text().replace(/\s\s+/g, ' ').replace(/[,]/g, '');
          itinerariCollegati = itinerariCollegati.split(' ').map(value => parseInt(value)).filter(value => !isNaN(value));
          itinerariCollegati.forEach(idItinerario => itinerari[idItinerario].IDlocalita = newLocalita.id);
          luoghi[nome].itinerariCollegati = luoghi[nome].itinerariCollegati.concat(itinerariCollegati);
        }
      });
      promises.push(promise);
    }
    return Promise.all(promises);
  });*/
