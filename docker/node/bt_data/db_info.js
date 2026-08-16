var dbcon = {}

// Init DB settings
dbcon.host = 'mysql';
dbcon.port = 3306;
dbcon.mysql_user = process.env.MYSQL_USER || 'berrytube';
dbcon.mysql_pass = process.env.MYSQL_PASSWORD || 'berrytube';
dbcon.database = process.env.MYSQL_DATABASE || 'berrytube';
dbcon.video_table = 'videos';

module.exports = dbcon;
