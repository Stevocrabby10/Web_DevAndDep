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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'James_Bond','$2a$12$TdeOD/g0EcPAB4PB55ra/eCkECcBHnUEC.VdMYPIQC0f9AhLV5Jlu','London, UK'),(2,'alex','$2a$12$GjGVAeJkRzITlyXc4AFcp.RE9lijFQ/s25pQMH7.BQ.slNWiqVAny','Dublin'),(3,'liam','$2a$12$1dlNcmJvt/vDzQE8HGUI/eUUpNJWTlOcosU3QGODYUkjM.PxA716G','Galway, Ireland'),(10,'123','$2b$10$4tb8mlmYSgFnTfrS0b7wWu2KmxSNedeEnDAzFj1eD60Zhdnf6gifG',NULL),(11,'jimmy','$2b$10$KGQ5n7USL/hp3e.kSB3QieDXsoEXm74RfIt.lffAAaV2aW2zBz2q.',NULL);
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

-- Dump completed on 2025-12-11 15:24:39
