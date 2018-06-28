use berrytube;
DROP PROCEDURE IF EXISTS update_schema;
DELIMITER //
CREATE PROCEDURE update_schema()
BEGIN

-- name is not yet a unique key, can't on dup key update

IF NOT EXISTS(SELECT value FROM misc WHERE name='dbversion') THEN
INSERT INTO misc (name,value) SELECT 'dbversion',1 WHERE NOT EXISTS (SELECT * FROM `misc` WHERE name='dbversion');
END IF;

IF (SELECT CAST(value AS DECIMAL) FROM misc WHERE name='dbversion') < 2 THEN

-- necessary to avoid errors on conversion due to 0 values; we got a column for it, let's use it.

UPDATE videos_history SET date_added = FROM_UNIXTIME(JSON_EXTRACT(meta,"$.addedon")/1000) WHERE date_added = 0 AND JSON_VALID(meta) AND JSON_EXTRACT(meta,"$.addedon") IS NOT NULL;
UPDATE videos_history SET date_added = FROM_UNIXTIME(0) WHERE date_added IS NULL;

ALTER DATABASE CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
ALTER TABLE `api` CONVERT TO CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci, ENGINE=InnoDB;
ALTER TABLE `areas` CONVERT TO CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci, ENGINE=InnoDB;
ALTER TABLE `ban_list` CONVERT TO CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci, ENGINE=InnoDB;
ALTER TABLE `misc` CONVERT TO CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci, ENGINE=InnoDB;
ALTER TABLE `users` CONVERT TO CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci, ENGINE=InnoDB;

-- Not converting, just changing defaults, videoid can be URLS, best to stay on latin1 to allow 1000 characters rather than 250 with utf8mb4

ALTER TABLE `videos` CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci, ENGINE=InnoDB;
ALTER TABLE `videos_history` CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci, ENGINE=InnoDB;

-- No need for text for the name, and we can index the names

ALTER TABLE `misc` CHANGE `name` `name` VARCHAR(64) CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci;
ALTER TABLE `users` CHANGE `name` `name` VARCHAR(16) CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci;
ALTER TABLE `areas` CHANGE `name` `name` VARCHAR(64) CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci;
CREATE UNIQUE INDEX misc_name_index ON berrytube.misc (name);
CREATE UNIQUE INDEX areas_name_index ON berrytube.areas (name);

-- apparently some duplicates exist, scrap those

DELETE FROM users USING users, users u2 WHERE users.id > u2.id and users.name = u2.name;
CREATE UNIQUE INDEX users_name_index ON berrytube.users (name);

-- changing all these manually, since videoid is better longer

ALTER TABLE `videos` CHANGE `videoid` `videoid` VARCHAR(1000) CHARACTER SET latin1, COLLATE = latin1_swedish_ci;
ALTER TABLE `videos_history` CHANGE `videoid` `videoid` VARCHAR(1000) CHARACTER SET latin1, COLLATE = latin1_swedish_ci;

ALTER TABLE `videos` CHANGE `videotype` `videotype` VARCHAR(16) CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci;
ALTER TABLE `videos_history` CHANGE `videotype` `videotype` VARCHAR(16) CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci;
ALTER TABLE `videos` CHANGE `meta` `meta` text CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci;
ALTER TABLE `videos` CHANGE `videotitle` `videotitle` text CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci;
ALTER TABLE `videos` CHANGE `videovia` `videovia` text CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci;
ALTER TABLE `videos_history` CHANGE `meta` `meta` text CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci;
ALTER TABLE `videos_history` CHANGE `videotitle` `videotitle` text CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci;

UPDATE users SET meta = FROM_BASE64(meta) WHERE meta IS NOT NULL;

ALTER TABLE `api` CHANGE `session` `session` TEXT CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci;
UPDATE api SET session = FROM_BASE64(session) WHERE session IS NOT NULL;

UPDATE misc SET value = FROM_BASE64(value) WHERE value IS NOT NULL AND FROM_BASE64(value) IS NOT NULL AND NAME NOT IN ('position','overrideCss','dbversion');

ALTER TABLE `areas` CHANGE `html` `html` MEDIUMTEXT CHARACTER SET utf8mb4, COLLATE = utf8mb4_0900_ai_ci;
UPDATE areas SET html = FROM_BASE64(html) WHERE html IS NOT NULL AND FROM_BASE64(html) IS NOT NULL;

UPDATE misc SET value=2 WHERE name='dbversion';
END IF;
END; //
DELIMITER ;

call update_schema();
DROP PROCEDURE IF EXISTS update_schema;

