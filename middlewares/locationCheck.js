const jwt = require("jsonwebtoken");
const mysql = require("mysql");
require("dotenv").config();
const { ROUNDS, HOST, USER, PASSWORD, DATABASE, JWTKEY } = process.env;

var con = mysql.createConnection({
	host: HOST,
	user: USER,
	password: PASSWORD,
	database: DATABASE,
	multipleStatements: false,
});
module.exports.locationCheck = (req, res, next) => {
	const { authorization } = req.headers;
	if (!authorization) {
		return res.status(400).json({ message: "Token is not provided" });
	} else if (!req.query.location) {
		return res.status(400).json({ message: "location is not provided" });
	}
	let filterLocation = req.query.location;

	let token = authorization.split(" ")[1];
	let decodedToken = jwt.decode(token);
	let { location } = decodedToken;
	let access = location.includes(filterLocation);
	if (access) {
		next();
	} else {
		res
			.status(404)
			.json({ message: `You are not authorized to location ${filterLocation}` });
	}
};
