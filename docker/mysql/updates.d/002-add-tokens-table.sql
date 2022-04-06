use berrytube;
DROP PROCEDURE IF EXISTS update_schema;
DELIMITER //
CREATE PROCEDURE update_schema()
BEGIN

  IF (SELECT CAST(value AS DECIMAL) FROM misc WHERE name='dbversion') < 3 THEN

    DROP TABLE IF EXISTS tokens;
    CREATE TABLE tokens (
      token VARCHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
      nick VARCHAR(16) NOT NULL,
      created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      PRIMARY KEY (token),
      CONSTRAINT fk_user
        FOREIGN KEY (nick)
        REFERENCES users(name)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

    UPDATE misc SET value=3 WHERE name='dbversion';
  
  END IF;

END; //
DELIMITER ;

call update_schema();
DROP PROCEDURE IF EXISTS update_schema;
