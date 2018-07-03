-- MySQL dump 10.13  Distrib 8.0.11, for Linux (x86_64)
--
-- Host: localhost    Database: berrytube
-- ------------------------------------------------------
-- Server version	8.0.11

 SET NAMES utf8mb4 ;

--
-- Table structure for table `api`
--

 SET character_set_client = utf8mb4 ;
CREATE TABLE `api` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ip` varchar(20) NOT NULL,
  `session` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `areas`
--

 SET character_set_client = utf8mb4 ;
CREATE TABLE `areas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `html` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `areas_name_index` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `misc`
--

 SET character_set_client = utf8mb4 ;
CREATE TABLE `misc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `value` mediumtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `misc_name_index` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `users`
--

 SET character_set_client = utf8mb4 ;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `pass` mediumtext NOT NULL,
  `type` int(11) NOT NULL,
  `meta` mediumtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_name_index` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `videos`
--

 SET character_set_client = utf8mb4 ;
CREATE TABLE `videos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `position` bigint(20) unsigned NOT NULL,
  `videoid` varchar(1000) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `videotitle` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `videolength` int(11) NOT NULL,
  `videovia` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `videotype` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `meta` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `videoid` (`videoid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `videos_history`
--

 SET character_set_client = utf8mb4 ;
CREATE TABLE `videos_history` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `videoid` varchar(1000) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `videotitle` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `videolength` int(11) NOT NULL,
  `videotype` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `date_added` datetime NOT NULL,
  `meta` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `videoid` (`videoid`),
  KEY `videos_history_videotitle_idx` (`videotitle`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
