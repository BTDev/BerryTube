var dbcon = {}

// Init DB settings
dbcon.host = 'mysql';
dbcon.post = 3306;
dbcon.mysql_user = 'berrytube';
dbcon.mysql_pass = 'berrytube';
dbcon.database = process.env.MYSQL_PASSWORD || 'berrytube';
dbcon.video_table = 'videos';

module.exports = dbcon;
