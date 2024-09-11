-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Počítač: 127.0.0.1
-- Vytvořeno: Stř 11. zář 2024, 11:19
-- Verze serveru: 10.4.32-MariaDB
-- Verze PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Databáze: `mydb`
--

-- --------------------------------------------------------

--
-- Struktura tabulky `notification`
--

CREATE TABLE `notification` (
  `idnotification` int(11) NOT NULL,
  `class` varchar(45) NOT NULL,
  `title` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `user`
--

CREATE TABLE `user` (
  `iduser` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `class` varchar(45) NOT NULL,
  `admin` tinyint(4) DEFAULT NULL,
  `classteacher` tinyint(4) DEFAULT NULL,
  `list_idlist` int(11) NOT NULL,
  `notification_idnotification` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `user_has_widget`
--

CREATE TABLE `user_has_widget` (
  `user_iduser` int(11) NOT NULL,
  `widget_idwidget` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `widget`
--

CREATE TABLE `widget` (
  `idwidget` int(11) NOT NULL,
  `class` varchar(45) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `paid` tinyint(4) DEFAULT NULL,
  `notification_idnotification` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Indexy pro exportované tabulky
--

--
-- Indexy pro tabulku `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`idnotification`);

--
-- Indexy pro tabulku `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`iduser`),
  ADD KEY `fk_user_notification1_idx` (`notification_idnotification`);

--
-- Indexy pro tabulku `user_has_widget`
--
ALTER TABLE `user_has_widget`
  ADD PRIMARY KEY (`user_iduser`,`widget_idwidget`),
  ADD KEY `fk_user_has_widget_widget1_idx` (`widget_idwidget`),
  ADD KEY `fk_user_has_widget_user1_idx` (`user_iduser`);

--
-- Indexy pro tabulku `widget`
--
ALTER TABLE `widget`
  ADD PRIMARY KEY (`idwidget`),
  ADD KEY `fk_widget_notification1_idx` (`notification_idnotification`);

--
-- AUTO_INCREMENT pro tabulky
--

--
-- AUTO_INCREMENT pro tabulku `notification`
--
ALTER TABLE `notification`
  MODIFY `idnotification` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `user`
--
ALTER TABLE `user`
  MODIFY `iduser` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `widget`
--
ALTER TABLE `widget`
  MODIFY `idwidget` int(11) NOT NULL AUTO_INCREMENT;

--
-- Omezení pro exportované tabulky
--

--
-- Omezení pro tabulku `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `fk_user_notification1` FOREIGN KEY (`notification_idnotification`) REFERENCES `notification` (`idnotification`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Omezení pro tabulku `user_has_widget`
--
ALTER TABLE `user_has_widget`
  ADD CONSTRAINT `fk_user_has_widget_user1` FOREIGN KEY (`user_iduser`) REFERENCES `user` (`iduser`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_user_has_widget_widget1` FOREIGN KEY (`widget_idwidget`) REFERENCES `widget` (`idwidget`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Omezení pro tabulku `widget`
--
ALTER TABLE `widget`
  ADD CONSTRAINT `fk_widget_notification1` FOREIGN KEY (`notification_idnotification`) REFERENCES `notification` (`idnotification`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
