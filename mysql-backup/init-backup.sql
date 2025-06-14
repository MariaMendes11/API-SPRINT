CREATE DATABASE  IF NOT EXISTS `banco_salas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `banco_salas`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: banco_salas
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `reserva`
--

DROP TABLE IF EXISTS `reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `fk_id_usuario` int NOT NULL,
  `fk_id_sala` int NOT NULL,
  `datahora_inicio` datetime NOT NULL,
  `datahora_fim` datetime NOT NULL,
  `status` enum('ativa','cancelada') DEFAULT 'ativa',
  `motivo_cancelamento` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_reserva`),
  KEY `fk_id_sala` (`fk_id_sala`),
  KEY `fk_id_usuario` (`fk_id_usuario`),
  CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`fk_id_sala`) REFERENCES `sala` (`id_sala`),
  CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`fk_id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva`
--

LOCK TABLES `reserva` WRITE;
/*!40000 ALTER TABLE `reserva` DISABLE KEYS */;
INSERT INTO `reserva` VALUES (14,4,2,'2025-09-10 11:00:00','2025-09-10 12:00:00','ativa',NULL),(18,4,13,'2025-06-26 09:00:00','2025-06-26 10:00:00','ativa',NULL);
/*!40000 ALTER TABLE `reserva` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_before_cancelar_reserva` BEFORE DELETE ON `reserva` FOR EACH ROW BEGIN
    DECLARE v_data_reserva DATE;

    -- Extrair a data da datahora_inicio
    SET v_data_reserva = DATE(OLD.datahora_inicio);

    -- Inserir os dados na tabela de reservas canceladas
    INSERT INTO reserva_cancelada (
        id_reserva,
        fk_id_usuario,
        fk_id_sala,
        data_reserva,
        created_at,
        motivo_cancelamento
    )
    VALUES (
        OLD.id_reserva,
        OLD.fk_id_usuario,
        OLD.fk_id_sala,
        v_data_reserva,
        OLD.datahora_inicio,
        OLD.motivo_cancelamento
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `reserva_cancelada`
--

DROP TABLE IF EXISTS `reserva_cancelada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva_cancelada` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_reserva` int NOT NULL,
  `fk_id_usuario` int NOT NULL,
  `fk_id_sala` int NOT NULL,
  `data_reserva` date NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `cancelada_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `motivo_cancelamento` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva_cancelada`
--

LOCK TABLES `reserva_cancelada` WRITE;
/*!40000 ALTER TABLE `reserva_cancelada` DISABLE KEYS */;
INSERT INTO `reserva_cancelada` VALUES (1,15,4,3,'2025-09-04','2025-09-04 14:00:00','2025-05-05 10:52:12',NULL),(2,16,4,10,'2025-09-09','2025-09-09 13:00:00','2025-05-05 11:04:27','Problema com a disponibilidade da sala'),(3,17,2,25,'2025-09-09','2025-09-09 13:00:00','2025-06-04 08:21:05','Não quero mais reservar neste dia');
/*!40000 ALTER TABLE `reserva_cancelada` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sala`
--

DROP TABLE IF EXISTS `sala`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sala` (
  `id_sala` int NOT NULL AUTO_INCREMENT,
  `classificacao` varchar(100) NOT NULL,
  `horarios_disponiveis` varchar(255) NOT NULL,
  `bloco` varchar(30) NOT NULL,
  PRIMARY KEY (`id_sala`),
  UNIQUE KEY `classificacao` (`classificacao`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sala`
--

LOCK TABLES `sala` WRITE;
/*!40000 ALTER TABLE `sala` DISABLE KEYS */;
INSERT INTO `sala` VALUES (2,'Alta Mogiana Automotiva','Segunda a sexta-feira, das 8h às 17h','A'),(3,'Alta Mogiana Desenvolvimento de Sistema','Segunda a sexta-feira, das 8h às 17h','A'),(4,'Alta Mogiana Eletroeletrônica','Segunda a sexta-feira, das 8h às 17h','A'),(5,'Alta Mogiana Manutenção','Segunda a sexta-feira, das 8h às 17h','A'),(6,'A1 - CONVERSORES','Segunda a sexta-feira, das 8h às 17h','A'),(7,'A2 - ELETRÔNICA','Segunda a sexta-feira, das 8h às 17h','A'),(8,'A3 - CLP','Segunda a sexta-feira, das 8h às 17h','A'),(9,'A4 - AUTOMAÇÃO','Segunda a sexta-feira, das 8h às 17h','A'),(10,'A5 - METROLOGIA','Segunda a sexta-feira, das 8h às 17h','A'),(11,'A6 - PNEUMÁTICA/HIDRÁULICA','Segunda a sexta-feira, das 8h às 17h','A'),(12,'B2 - SALA DE AULA','Segunda a sexta-feira, das 8h às 17h','B'),(13,'B3 - SALA DE AULA','Segunda a sexta-feira, das 8h às 17h','B'),(14,'B5 - SALA DE AULA','Segunda a sexta-feira, das 8h às 17h','B'),(15,'B6 - SALA DE AULA','Segunda a sexta-feira, das 8h às 17h','B'),(16,'B7 - SALA DE AULA','Segunda a sexta-feira, das 8h às 17h','B'),(17,'B8 - LAB. INFORMÁTICA','Segunda a sexta-feira, das 8h às 17h','B'),(18,'B9 - LAB. INFORMÁTICA','Segunda a sexta-feira, das 8h às 17h','B'),(19,'B10 - LAB. INFORMÁTICA','Segunda a sexta-feira, das 8h às 17h','B'),(20,'B11 - LAB. INFORMÁTICA','Segunda a sexta-feira, das 8h às 17h','B'),(21,'B12 - LAB. INFORMÁTICA','Segunda a sexta-feira, das 8h às 17h','B'),(22,'Colorado A1','Segunda a sexta-feira, das 8h às 17h','C'),(23,'Colorado Oficina','Segunda a sexta-feira, das 8h às 17h','C'),(24,'C1 - SALA DE AULA (ALP)','Segunda a sexta-feira, das 8h às 17h','C'),(25,'C2 - LAB. DE INFORMÁTICA','Segunda a sexta-feira, das 8h às 17h','C'),(26,'C3 - SALA DE MODELAGEM VESTUÁRIO','Segunda a sexta-feira, das 8h às 17h','C'),(27,'C4 - SALA DE MODELAGEM VESTUÁRIO','Segunda a sexta-feira, das 8h às 17h','C'),(28,'C5 - SALA DE AULA','Segunda a sexta-feira, das 8h às 17h','C'),(29,'D1 - SALA MODELAGEM','Segunda a sexta-feira, das 8h às 17h','D'),(30,'D2 - SALA DE MODELAGEM','Segunda a sexta-feira, das 8h às 17h','D'),(31,'D3 - SALA DE AULA','Segunda a sexta-feira, das 8h às 17h','D'),(32,'D4 - SALA DE CRIAÇÃO','Segunda a sexta-feira, das 8h às 17h','D'),(33,'LAB. ALIMENTOS','Segunda a sexta-feira, das 8h às 17h','Lab'),(34,'OFICINA DE AJUSTAGEM/FRESAGEM','Segunda a sexta-feira, das 8h às 17h','Oficina'),(35,'OFICINA - COMANDOS ELÉTRICOS','Segunda a sexta-feira, das 8h às 17h','Oficina'),(36,'OFICINA DE TORNEARIA','Segunda a sexta-feira, das 8h às 17h','Oficina'),(37,'OFICINA DE SOLDAGEM','Segunda a sexta-feira, das 8h às 17h','Oficina'),(38,'OFICINA DE CNC','Segunda a sexta-feira, das 8h às 17h','Oficina');
/*!40000 ALTER TABLE `sala` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `cpf` char(14) NOT NULL,
  `senha` varchar(255) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'A','a@a','22222222222','$2b$10$tKC19GX8BrnLS0Oy98ZSR.2EwifkPhrh/WwCZJk8tjLsL0DZEhBQa');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'banco_salas'
--

--
-- Dumping routines for database 'banco_salas'
--
/*!50003 DROP FUNCTION IF EXISTS `total_reservas_usuario` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `total_reservas_usuario`(p_id_usuario INT) RETURNS int
    DETERMINISTIC
BEGIN
    DECLARE total INT;
    
    SELECT COUNT(*) INTO total
    FROM reserva
    WHERE fk_id_usuario = p_id_usuario;
    
    RETURN total;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `cancelar_reserva` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `cancelar_reserva`(
    IN p_id_reserva INT,
    IN p_motivo_cancelamento VARCHAR(255)
)
BEGIN
    DECLARE v_fk_id_usuario INT;
    DECLARE v_fk_id_sala INT;
    DECLARE v_data_reserva DATE;
    DECLARE v_created_at DATETIME;

    -- Buscar os dados da reserva
    SELECT fk_id_usuario, fk_id_sala, DATE(datahora_inicio), datahora_inicio
    INTO v_fk_id_usuario, v_fk_id_sala, v_data_reserva, v_created_at
    FROM reserva
    WHERE id_reserva = p_id_reserva;

    -- Inserir na tabela de reservas canceladas (com os nomes corretos)
    INSERT INTO reserva_cancelada (
        id_reserva, fk_id_usuario, fk_id_sala, data_reserva, created_at, motivo_cancelamento
    ) VALUES (
        p_id_reserva, v_fk_id_usuario, v_fk_id_sala, v_data_reserva, v_created_at, p_motivo_cancelamento
    );

    -- Excluir a reserva original
    DELETE FROM reserva WHERE id_reserva = p_id_reserva;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-09 16:13:17
