const MySql = require("sync-mysql");
require("dotenv").config();

const { ROUNDS, HOST, USER, PASSWORD, DATABASE } = process.env;

var connection = new MySql({
	host: HOST,
	user: USER,
	password: PASSWORD,
	database: DATABASE,
	multipleStatements: false,
});

module.exports = connection;
