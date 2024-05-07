const jwt = require("jsonwebtoken");
require("dotenv").config();

const { JWTKEY } = process.env;

function isAuthenticated(req, res, next) {
	const { authorization } = req.headers;
	if (!authorization) {
		res.status(400).json({ message: "Token in not provided" });
	}


	const token = authorization.split(" ")[1];
	const decodedToken = jwt.verify(token, 'accessSecret');
	if (decodedToken) {
		next();
	} else {
		res.status(404).json({ message: "You Are Not Authorised" });
	}
}
function verifyRefresh(token) {
	const decoded = jwt.verify(token, "refreshSecret");
	return decoded.email;
}

module.exports = { isAuthenticated, verifyRefresh };
