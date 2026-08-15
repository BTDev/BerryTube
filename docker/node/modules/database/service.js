const fs = require("node:fs/promises");
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

    this.connect();
  }

  /** @param {mysql.ConnectionConfig} [options] */
  connect(options) {
    this.connection = mysql.createConnection({
			host: config.host,
			port: config.post,
			user: config.mysql_user,
      password: config.mysql_pass,
			...options,
    });

    this.connection.on("error", err => {
			this.log.error(
				events.EVENT_DB_CONNECTION,
				"the database connection threw an error: attempting reconnect",
				{},
				err,
			);
			setTimeout(() => {
				this.init();
			}, 1000);
		});

		this.connection.query(`use ${config.database}`);
  }

	rawQuery(sql, params = []) {
		return new Promise((res, rej) => {
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

	query(queryParts, ...params) {
		return this.rawQuery(queryParts.join(" ? "), params);
	}

	/** Create missing tables and migrate existing ones to latest schema */
  async migrate() {
		const runFolder = async (folder, versioned) => {
			const fnames = await fs.readdir(folder);
			fnames.sort();
			for (const fname of fnames) {
				const migrationVersion = versioned ? parseInt(fname.split("-", 2)[0], 10) : null;
				if (migrationVersion) {
					const { result } = await this.query`SELECT value FROM misc WHERE name='dbversion'`;
					const databaseVersion = parseInt(result[0].value, 10);
					if (migrationVersion <= databaseVersion) {
						continue;
					}
				}

				console.log(`Running migration ${fname}`);
				const source = await fs.readFile(`${folder}/${fname}`, { encoding: "utf8" });
				await this.rawQuery(source);

				if (migrationVersion) {
					await this.query`UPDATE misc SET value=${migrationVersion} WHERE name='dbversion'`;
				}
			}
    };

    this.connect({
      multipleStatements: true
    });

		const { result: lockResult } = await this.query`SELECT GET_LOCK('berrytube-migrate', -1) AS locked`;
		if (lockResult[0].locked !== 1) {
			throw new Error("Failed to acquire migration lock");
		}

		const { result: checkResult } = await this.query`
      SELECT *
      FROM information_schema.tables
      WHERE table_schema = ${config.database}
          AND table_name = 'misc'
      LIMIT 1;
      `;
		if (checkResult.length === 0) {
			await runFolder("./bt_data/migrations/initial", false);
		}
		await runFolder("./bt_data/migrations/update", true);

		const { result: releaseResult } = await this.query`SELECT RELEASE_LOCK('berrytube-migrate') AS released`;
		if (releaseResult[0].released !== 1) {
			throw new Error("Failed to release migration lock");
    }

    this.connect();
	}
};
