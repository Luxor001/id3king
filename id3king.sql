-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versione server:              10.2.11-MariaDB - mariadb.org binary distribution
-- S.O. server:                  Win64
-- HeidiSQL Versione:            9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dump della struttura del database id3king
CREATE DATABASE IF NOT EXISTS `id3king` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `id3king`;

-- Dump della struttura di evento id3king.DeleteExpiredTokensEvent
DELIMITER //
CREATE DEFINER=`id3king`@`localhost` EVENT `DeleteExpiredTokensEvent` ON SCHEDULE EVERY 12 HOUR STARTS '2018-01-01 06:00:00' ON COMPLETION NOT PRESERVE ENABLE COMMENT 'Elimina su base giornaliera i token scaduti dalla tabella login' DO BEGIN
DELETE FROM login
WHERE timestamp < (NOW()-INTERVAL 1 DAY);
END//
DELIMITER ;

-- Dump della struttura di tabella id3king.difficolta
CREATE TABLE IF NOT EXISTS `difficolta` (
  `ID` int(11) NOT NULL,
  `Valore` char(3) NOT NULL,
  `Significato` char(40) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Valore` (`Valore`),
  KEY `ID` (`ID`),
  KEY `ID_2` (`ID`),
  KEY `ID_3` (`ID`),
  KEY `ID_4` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dump dei dati della tabella id3king.difficolta: ~5 rows (circa)
/*!40000 ALTER TABLE `difficolta` DISABLE KEYS */;
INSERT INTO `difficolta` (`ID`, `Valore`, `Significato`) VALUES
	(1, 'T', 'Turistico'),
	(2, 'E', 'Escursionistico'),
	(3, 'EE', 'Escursionisti Esperti'),
	(4, 'EEA', 'Escursionisti Esperti Attrezzati'),
	(5, 'EAI', 'Escursionisti in Ambiente Innevato');
/*!40000 ALTER TABLE `difficolta` ENABLE KEYS */;

-- Dump della struttura di tabella id3king.itinerariopreferito
CREATE TABLE IF NOT EXISTS `itinerariopreferito` (
  `IDUtente` int(11) NOT NULL,
  `IDPercorso` int(11) NOT NULL,
  PRIMARY KEY (`IDUtente`,`IDPercorso`),
  KEY `IDPercorso` (`IDPercorso`),
  CONSTRAINT `ItinerarioPreferito_FKUtente` FOREIGN KEY (`IDUtente`) REFERENCES `utenti` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ItinerarioPreferito_ibfk_1` FOREIGN KEY (`IDPercorso`) REFERENCES `percorso` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dump dei dati della tabella id3king.itinerariopreferito: ~0 rows (circa)
/*!40000 ALTER TABLE `itinerariopreferito` DISABLE KEYS */;
/*!40000 ALTER TABLE `itinerariopreferito` ENABLE KEYS */;

-- Dump della struttura di tabella id3king.localita
CREATE TABLE IF NOT EXISTS `localita` (
  `ID` int(11) NOT NULL,
  `Denominazione` char(40) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Nome` (`Denominazione`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dump dei dati della tabella id3king.localita: ~38 rows (circa)
/*!40000 ALTER TABLE `localita` DISABLE KEYS */;
/*!40000 ALTER TABLE `localita` ENABLE KEYS */;

-- Dump della struttura di tabella id3king.login
CREATE TABLE IF NOT EXISTS `login` (
  `userId` int(11) NOT NULL,
  `logintoken` char(32) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`userId`,`logintoken`),
  CONSTRAINT `login_FKUtente` FOREIGN KEY (`userId`) REFERENCES `utenti` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dump dei dati della tabella id3king.login: ~0 rows (circa)
/*!40000 ALTER TABLE `login` DISABLE KEYS */;
/*!40000 ALTER TABLE `login` ENABLE KEYS */;

-- Dump della struttura di tabella id3king.percorso
CREATE TABLE IF NOT EXISTS `percorso` (
  `ID` int(11) NOT NULL,
  `Nome` char(120) DEFAULT NULL,
  `DataInizio` date DEFAULT NULL,
  `DataFine` date DEFAULT NULL,
  `URL` char(255) DEFAULT NULL,
  `Descrizione` varchar(1000) DEFAULT NULL,
  `Durata` int(11) DEFAULT NULL,
  `Lunghezza` int(11) DEFAULT NULL,
  `Dislivello` int(11) DEFAULT NULL,
  `TrackURL` char(255) DEFAULT NULL,
  `MapURL` char(255) DEFAULT NULL,
  `Difficolta` int(11) DEFAULT NULL,
  `Localita` int(11) DEFAULT NULL,
  `ContatoreAccessi` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`),
  KEY `Difficolta` (`Difficolta`),
  KEY `Difficolta_2` (`Difficolta`,`Localita`),
  KEY `Localita` (`Localita`),
  CONSTRAINT `Percorso_ibfk_1` FOREIGN KEY (`Difficolta`) REFERENCES `difficolta` (`ID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Percorso_ibfk_2` FOREIGN KEY (`Localita`) REFERENCES `localita` (`ID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dump dei dati della tabella id3king.percorso: ~0 rows (circa)
/*!40000 ALTER TABLE `percorso` DISABLE KEYS */;
/*!40000 ALTER TABLE `percorso` ENABLE KEYS */;

-- Dump della struttura di tabella id3king.periodo
CREATE TABLE IF NOT EXISTS `periodo` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Stagione` char(20) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- Dump dei dati della tabella id3king.periodo: ~3 rows (circa)
/*!40000 ALTER TABLE `periodo` DISABLE KEYS */;
INSERT INTO `periodo` (`ID`, `Stagione`) VALUES
	(1, 'Inverno'),
	(2, 'Primavera'),
	(3, 'Estate'),
	(4, 'Autunno');
/*!40000 ALTER TABLE `periodo` ENABLE KEYS */;

-- Dump della struttura di tabella id3king.ricerca
CREATE TABLE IF NOT EXISTS `ricerca` (
  `IDUtente` int(11) NOT NULL,
  `NomeRicerca` char(20) NOT NULL,
  `DislivelloMassimo` int(11) DEFAULT NULL,
  `LunghezzaMassima` int(11) DEFAULT NULL,
  `DurataMassima` int(11) DEFAULT NULL,
  `Localita` int(11) DEFAULT NULL,
  `Difficolta` int(11) DEFAULT NULL,
  `Periodo` int(11) DEFAULT NULL,
  PRIMARY KEY (`IDUtente`,`NomeRicerca`),
  KEY `Localita` (`Localita`),
  KEY `Difficolta` (`Difficolta`),
  KEY `FK_Periodo` (`Periodo`),
  CONSTRAINT `FK_Periodo` FOREIGN KEY (`Periodo`) REFERENCES `periodo` (`ID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Ricerca_ibfk_2` FOREIGN KEY (`Localita`) REFERENCES `localita` (`ID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Ricerca_ibfk_3` FOREIGN KEY (`Difficolta`) REFERENCES `difficolta` (`ID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Utente` FOREIGN KEY (`IDUtente`) REFERENCES `utenti` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dump dei dati della tabella id3king.ricerca: ~0 rows (circa)
/*!40000 ALTER TABLE `ricerca` DISABLE KEYS */;
/*!40000 ALTER TABLE `ricerca` ENABLE KEYS */;

-- Dump della struttura di tabella id3king.utenti
CREATE TABLE IF NOT EXISTS `utenti` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `username` char(30) NOT NULL,
  `password` char(100) NOT NULL,
  `UltimoPercorsoRicercato` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `username` (`username`),
  KEY `FK1_ultimopercorsoricercato` (`UltimoPercorsoRicercato`),
  CONSTRAINT `FK1_ultimopercorsoricercato` FOREIGN KEY (`UltimoPercorsoRicercato`) REFERENCES `percorso` (`ID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

-- Dump dei dati della tabella id3king.utenti: ~1 rows (circa)
/*!40000 ALTER TABLE `utenti` DISABLE KEYS */;
/*!40000 ALTER TABLE `utenti` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
