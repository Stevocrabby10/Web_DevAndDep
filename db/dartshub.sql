CREATE DATABASE  IF NOT EXISTS `dartshub` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `dartshub`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: dartshub
-- ------------------------------------------------------
-- Server version	9.4.0-commercial

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `favourites`
--

DROP TABLE IF EXISTS `favourites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favourites` (
  `idFavourite` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `itemName` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFavourite`),
  KEY `fk_favourites_user` (`userId`),
  CONSTRAINT `fk_favourites_user` FOREIGN KEY (`userId`) REFERENCES `users` (`idUser`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favourites`
--

LOCK TABLES `favourites` WRITE;
/*!40000 ALTER TABLE `favourites` DISABLE KEYS */;
INSERT INTO `favourites` VALUES (1,1,'Dublin City Darts League','2025-12-01 12:32:20'),(2,1,'Rosslare Harbour League','2025-12-01 12:32:20'),(3,2,'West Galway Arrows','2025-12-01 12:32:20'),(4,3,'East Cork Premier League','2025-12-01 12:32:20'),(5,1,'Dublin City Darts League','2025-12-01 13:02:52'),(6,1,'Champions Cup 2025','2025-12-01 13:02:52'),(7,2,'Cork Night Darts League','2025-12-01 13:02:52'),(8,3,'Galway Open','2025-12-01 13:02:52'),(9,3,'Irish Premier League','2025-12-01 13:02:58');
/*!40000 ALTER TABLE `favourites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `league_standings`
--

DROP TABLE IF EXISTS `league_standings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `league_standings` (
  `idStanding` int NOT NULL AUTO_INCREMENT,
  `leagueId` int NOT NULL,
  `position` int NOT NULL,
  `entry_name` varchar(255) NOT NULL,
  `played` int NOT NULL DEFAULT '0',
  `won` int NOT NULL DEFAULT '0',
  `lost` int NOT NULL DEFAULT '0',
  `points` int NOT NULL DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idStanding`),
  UNIQUE KEY `uq_league_position` (`leagueId`,`position`),
  CONSTRAINT `fk_standings_league` FOREIGN KEY (`leagueId`) REFERENCES `leagues` (`idLeague`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `league_standings`
--

LOCK TABLES `league_standings` WRITE;
/*!40000 ALTER TABLE `league_standings` DISABLE KEYS */;
INSERT INTO `league_standings` VALUES (1,5,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(2,5,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(3,5,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(4,5,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(5,5,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(6,18,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(7,18,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(8,18,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(9,18,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(10,18,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(11,8,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(12,8,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(13,8,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(14,8,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(15,8,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(16,17,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(17,17,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(18,17,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(19,17,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(20,17,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(21,1,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(22,1,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(23,1,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(24,1,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(25,1,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(26,14,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(27,14,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(28,14,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(29,14,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(30,14,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(31,13,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(32,13,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(33,13,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(34,13,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(35,13,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(36,9,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(37,9,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(38,9,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(39,9,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(40,9,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(41,11,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(42,11,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(43,11,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(44,11,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(45,11,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(46,4,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(47,4,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(48,4,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(49,4,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(50,4,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(51,15,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(52,15,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(53,15,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(54,15,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(55,15,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(56,16,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(57,16,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(58,16,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(59,16,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(60,16,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(61,3,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(62,3,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(63,3,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(64,3,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(65,3,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(66,7,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(67,7,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(68,7,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(69,7,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(70,7,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(71,12,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(72,12,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(73,12,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(74,12,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(75,12,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(76,2,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(77,2,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(78,2,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(79,2,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(80,2,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(81,6,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(82,6,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(83,6,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(84,6,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(85,6,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(86,19,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(87,19,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(88,19,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(89,19,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(90,19,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(91,20,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(92,20,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(93,20,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(94,20,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(95,20,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31'),(96,10,5,'Player 5',12,4,8,8,'2025-12-14 19:10:31'),(97,10,4,'Player 4',12,6,6,12,'2025-12-14 19:10:31'),(98,10,3,'Player 3',12,8,4,16,'2025-12-14 19:10:31'),(99,10,2,'Player 2',12,10,2,20,'2025-12-14 19:10:31'),(100,10,1,'Player 1',12,12,0,24,'2025-12-14 19:10:31');
/*!40000 ALTER TABLE `league_standings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leagues`
--

DROP TABLE IF EXISTS `leagues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leagues` (
  `idLeague` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `area` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL,
  `venue` varchar(255) NOT NULL,
  `next_match_date` date DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  PRIMARY KEY (`idLeague`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leagues`
--

LOCK TABLES `leagues` WRITE;
/*!40000 ALTER TABLE `leagues` DISABLE KEYS */;
INSERT INTO `leagues` VALUES (1,'Dublin City Darts League','Dublin','Dublin City Centre','The Long Hall Pub','2025-11-05','dublin-city'),(2,'Southside Arrows League','Dublin','South Dublin','O\'Brien\'s Bar','2025-11-07','southside-arrows'),(3,'Northside Premier Division','Dublin','North Dublin','The Black Swan','2025-11-08','northside-premier'),(4,'Galway Bay Darts League','Galway','Galway City','The Skeffington Arms','2025-11-06','galway-bay'),(5,'Connemara Darts Championship','Galway','Connemara','Connemara Inn','2025-11-09','connemara-championship'),(6,'West Galway Arrows','Galway','Galway City','The King\'s Head','2025-11-11','west-galway-arrows'),(7,'Rebel County Darts League','Cork','Cork City','The Hi-B Bar','2025-11-05','rebel-county'),(8,'Cork Harbour Arrows','Cork','Cork City Centre','The Oliver Plunkett','2025-11-07','cork-harbour-arrows'),(9,'East Cork Premier League','Cork','East Cork','The Anchor Bar','2025-11-10','east-cork-premier'),(10,'Wexford Town Darts League','Wexford','Wexford Town','The Sky & The Ground','2025-11-06','wexford-town'),(11,'Enniscorthy Darts Championship','Wexford','Enniscorthy','The Riverside Inn','2025-11-08','enniscorthy-championship'),(12,'Rosslare Harbour League','Wexford','Rosslare','The Strand Bar','2025-11-12','rosslare-harbour'),(13,'Dublin West Darts','Dublin','West Dublin','The Gravediggers','2025-11-09','dublin-west'),(14,'Dublin Elite Championship','Dublin','Dublin City Centre','The Shelbourne','2025-11-12','dublin-elite'),(15,'East Galway Darts League','Galway','East Galway','The Portumna Inn','2025-11-10','galway-east'),(16,'Galway Pro Division','Galway','Galway City Centre','Taaffe\'s Bar','2025-11-13','galway-pro'),(17,'Midleton Darts Championship','Cork','Midleton','The Jameson Inn','2025-11-11','cork-midleton'),(18,'Cork Elite Masters','Cork','Cork City','The Thirsty Scholar','2025-11-14','cork-elite'),(19,'Wexford County Darts','Wexford','Wexford','The Westgate Inn','2025-11-09','wexford-county'),(20,'Wexford Pro Masters','Wexford','Wexford','Dunbrody House','2025-11-15','wexford-pro');
/*!40000 ALTER TABLE `leagues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `league_name` varchar(255) NOT NULL,
  `reviewer` varchar(255) NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,'Dublin Premier League','James_Bond',5,'Fantastic league!','2025-11-30 23:17:34'),(2,'Cork City League','alex',4,'Great matches, well organized.','2025-11-30 23:17:34'),(3,'Galway Open','liam',3,'Pretty good overall.','2025-11-30 23:17:34'),(5,'Northside Premier Division','liam',3,'really cool','2025-11-30 23:43:12'),(6,'Dublin City Darts League','James_Bond',5,'Fantastic league!','2025-11-30 23:51:10'),(7,'Rebel County Darts League','alex',4,'Great matches, well organized.','2025-11-30 23:51:10'),(8,'Galway Bay Darts League','liam',3,'Pretty good overall.','2025-11-30 23:51:10'),(9,'Southside Arrows League','liam',3,'cheese\n','2025-11-30 23:55:37'),(10,'Connemara Darts Championship','liam',4,'ngadg','2025-12-01 12:35:22'),(11,'Southside Arrows League','liam',5,'rtyrty','2025-12-01 13:04:57'),(12,'Southside Arrows League','liam',3,'does this work ','2025-12-01 13:05:25'),(13,'Northside Premier Division','liam',2,'this works\n','2025-12-01 13:08:13');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_leagues`
--

DROP TABLE IF EXISTS `user_leagues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_leagues` (
  `idUserLeague` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `leagueId` int NOT NULL,
  `status` enum('CURRENT','PAST') NOT NULL DEFAULT 'CURRENT',
  `joined_at` date DEFAULT NULL,
  `finished_at` date DEFAULT NULL,
  PRIMARY KEY (`idUserLeague`),
  UNIQUE KEY `uq_user_league` (`userId`,`leagueId`),
  KEY `fk_user_leagues_league` (`leagueId`),
  CONSTRAINT `fk_user_leagues_league` FOREIGN KEY (`leagueId`) REFERENCES `leagues` (`idLeague`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_leagues_user` FOREIGN KEY (`userId`) REFERENCES `users` (`idUser`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_leagues`
--

LOCK TABLES `user_leagues` WRITE;
/*!40000 ALTER TABLE `user_leagues` DISABLE KEYS */;
INSERT INTO `user_leagues` VALUES (1,3,1,'CURRENT','2025-12-14',NULL),(4,3,7,'PAST','2024-01-01','2024-06-01'),(16,3,5,'CURRENT','2025-12-14',NULL),(18,3,2,'CURRENT','2025-12-14',NULL),(19,3,3,'CURRENT','2025-12-14',NULL);
/*!40000 ALTER TABLE `user_leagues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `idUser` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idUser`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'James_Bond','$2a$12$TdeOD/g0EcPAB4PB55ra/eCkECcBHnUEC.VdMYPIQC0f9AhLV5Jlu','London, UK'),(2,'alex','$2a$12$GjGVAeJkRzITlyXc4AFcp.RE9lijFQ/s25pQMH7.BQ.slNWiqVAny','Dublin'),(3,'liam','$2a$12$1dlNcmJvt/vDzQE8HGUI/eUUpNJWTlOcosU3QGODYUkjM.PxA716G','Donegal, Ireland'),(10,'123','$2b$10$4tb8mlmYSgFnTfrS0b7wWu2KmxSNedeEnDAzFj1eD60Zhdnf6gifG',NULL),(11,'jimmy','$2b$10$KGQ5n7USL/hp3e.kSB3QieDXsoEXm74RfIt.lffAAaV2aW2zBz2q.',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-14 19:12:21
