INSERT INTO `videos` SELECT 1,1,'vcPE8BJ8z0E','MLP%20Fighting%20is%20Magic%20-%20Pinkie%20Pie%20Theme',201,'klossi','yt','{\"addedon\":1409853514572}' WHERE NOT EXISTS (SELECT * FROM `videos`);
INSERT INTO `areas` (name,html) SELECT 'header','' WHERE NOT EXISTS (SELECT * FROM `areas` WHERE name='header');
INSERT INTO `areas` (name,html) SELECT 'footer','' WHERE NOT EXISTS (SELECT * FROM `areas` WHERE name='footer');
INSERT INTO `areas` (name,html) SELECT 'motd','' WHERE NOT EXISTS (SELECT * FROM `areas` WHERE name='motd');
INSERT INTO `misc` (name,value) SELECT 'dbversion','2' WHERE NOT EXISTS (SELECT * FROM `misc` WHERE name='dbversion');
