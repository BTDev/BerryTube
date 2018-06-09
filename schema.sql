-- MySQL dump 10.13  Distrib 5.7.22, for Linux (i686)
--
-- Host: localhost    Database: btube
-- ------------------------------------------------------
-- Server version	5.7.22-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `api`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `api` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ip` varchar(20) NOT NULL,
  `session` blob NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=74 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `areas`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `areas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `html` blob NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `giveaway_registration`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `giveaway_registration` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` text NOT NULL,
  `email` text NOT NULL,
  `regip` text NOT NULL,
  `confirmip` text NOT NULL,
  `verified` text NOT NULL,
  `on` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `misc`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `misc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `value` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=760652 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `pass` text NOT NULL,
  `type` int(11) NOT NULL,
  `meta` text,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4651 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `videos`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `videos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `position` bigint(20) unsigned NOT NULL,
  `videoid` varchar(1000) NOT NULL,
  `videotitle` text NOT NULL,
  `videolength` int(11) NOT NULL,
  `videovia` text NOT NULL,
  `videotype` varchar(10) NOT NULL,
  `meta` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `videoid` (`videoid`)
) ENGINE=MyISAM AUTO_INCREMENT=132208 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `videos_PUSH`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `videos_PUSH` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `position` bigint(20) unsigned NOT NULL,
  `videoid` varchar(20) NOT NULL,
  `videotitle` text NOT NULL,
  `videolength` int(11) NOT NULL,
  `videovia` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `videoid` (`videoid`)
) ENGINE=MyISAM AUTO_INCREMENT=744 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `videos_bak`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `videos_bak` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `position` bigint(20) unsigned NOT NULL,
  `videoid` varchar(20) NOT NULL,
  `videotitle` text NOT NULL,
  `videolength` int(11) NOT NULL,
  `videovia` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `videoid` (`videoid`)
) ENGINE=MyISAM AUTO_INCREMENT=331 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `videos_fool`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `videos_fool` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `position` bigint(20) unsigned NOT NULL,
  `videoid` varchar(1000) NOT NULL,
  `videotitle` text NOT NULL,
  `videolength` int(11) NOT NULL,
  `videovia` text NOT NULL,
  `videotype` varchar(10) NOT NULL,
  `meta` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `videoid` (`videoid`)
) ENGINE=MyISAM AUTO_INCREMENT=623 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `videos_history`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `videos_history` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `videoid` varchar(1000) NOT NULL,
  `videotitle` text NOT NULL,
  `videolength` int(11) NOT NULL,
  `videotype` varchar(10) NOT NULL,
  `date_added` datetime NOT NULL,
  `meta` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `videoid` (`videoid`),
  KEY `videos_history_videotitle_idx` (`videotitle`(50))
) ENGINE=MyISAM AUTO_INCREMENT=109168 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `videos_twoyear`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `videos_twoyear` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `position` bigint(20) unsigned NOT NULL,
  `videoid` varchar(1000) NOT NULL,
  `videotitle` text NOT NULL,
  `videolength` int(11) NOT NULL,
  `videovia` text NOT NULL,
  `videotype` varchar(10) NOT NULL,
  `meta` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `videoid` (`videoid`)
) ENGINE=MyISAM AUTO_INCREMENT=1839 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-06-09 10:20:30
