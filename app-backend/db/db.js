const mariadb = require("mariadb");
require("dotenv").config();
const data = require("../config/db-credentials");

const pool = mariadb.createPool({
	host: data.host,
	user: data.user,
	password: data.password,
	database: data.database,
	connectionLimit: 1,
});

async function getConnection() {
	try {
		const connection = await pool.getConnection();
		return connection;
	} catch (error) {
		throw new Error("No se pudo establecer una conexión con la base de datos.");
	}
}

module.exports = getConnection;