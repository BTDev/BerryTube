const mysql = require("mysql");
const config = require("../../bt_data/db_info");

const { ServiceBase } = require("../base");
const { events } = require("../log");

exports.DatabaseService = class extends ServiceBase {
	constructor(services) {
		super(services);
		this.log = services.log;
	}

	init() {
		super.init();

		this.log.info(events.EVENT_DB_CONNECTION, "starting database connection to {user}@{host}:{port}", {
			host: config.host,
			port: config.post,
			user: config.mysql_user,
		});

		this.connection = mysql.createConnection({
			host: config.host,
			port: config.post,
			user: config.mysql_user,
			password: config.mysql_pass,
		});

		this.connection.on("error", function(err) {
			this.log.error(
				events.EVENT_DB_CONNECTION,
				"the database connection threw an error: attempting reconnect",
				{},
				err,
			);
			setTimeout(function() {
				this.init();
			}, 1000);
		});

		this.connection.query(`use ${config.database}`);
	}

	query(queryParts, ...params) {
		return new Promise((res, rej) => {
			const sql = queryParts.join(" ? ");
			this.connection.query(sql, params, (err, result, fields) => {
				if (err) {
					rej(err);
					this.log.error(events.EVENT_DB_QUERY, 'query "{sql}" failed', { sql }, err);
					return;
				}

				res({ result, fields });
			});
		});
	}
};
