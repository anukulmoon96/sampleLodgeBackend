const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
var connection = require("../Config/db");
const mysql = require("mysql");
const crypto = require("crypto");
require("dotenv").config();
const { verifyRefresh } = require("../middlewares/helper");
// var con = require("../Config/db");

const { ROUNDS, HOST, USER, PASSWORD, DATABASE, JWTKEY } = process.env;

var con = mysql.createConnection({
	host: HOST,
	user: USER,
	password: PASSWORD,
	database: DATABASE,
	multipleStatements: false,
});

con.connect(function (err) {
	if (err) throw err;
	console.log("Connection done");
});

module.exports.signup = async (req, res) => {
	const { name, email, password, location } = req.body;
	let locationStrings = JSON.stringify(location);
	let passwordRegex = new RegExp(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
	);
	if (passwordRegex.test(password)) {
		let sqlQuery =
			"select id,name,email,access,last_login,location from GWR.users where email=?";
		con.query(sqlQuery, [email], (err, result) => {
			if (err) {
				res.send("Error Caught");
			} else {
				if (result.length > 0) {
					res.send("Users Already Exists");
				} else {
					bcrypt.hash(password, 10, function (err, hash) {
						// Store hash in your password DB.
						if (err) {
							res.send("Error caught");
						} else {
							let saveSqlQuery =
								"Insert into GWR.users(name,email,password,location) values (?,?,?,?);";
							con.query(
								saveSqlQuery,
								[name, email, hash, locationStrings],
								(err, result) => {
									if (err) {
										res.send("Error caught");
									} else {
										res.status(200).json({ message: "User got registered with us" });
									}
								}
							);
						}
					});
				}
			}
		});
	} else {
		res.status(400).json({
			message:
				"Password must be 8 character long or more and has one Uppercase,One LowerCase,One Digit and a special Character.",
		});
	}
};

module.exports.login = async (req, res) => {
	const { email, password, recaptchaValue } = req.body;
	if (!email) {
		//throw new Error("Email or Data is incorrect");
		return res.status(200).send({
			msg: "Email or password is incorrect!",
		});
	} else {
		axios({
			url: `https://www.google.com/recaptcha/api/siteverify?secret=6Ld3IyolAAAAAMVk6ORHuQuX42HOc-eJfO5fHVX3&response=${recaptchaValue}`,
			method: "POST",
		})
			.then((data) => {
				if (data.data.success) {
					let loginSqlQuery = `SELECT id,name,email,password,access,last_login,location,designation FROM GWR.users WHERE email = ? and incorrect_password_attempts < 5;`;
					con.query(loginSqlQuery, [email], (err, result) => {
						// user does not exists
						if (err) {
							//throw err;
							return res.status(400).send({
								msg: "Database error!",
							});
						}
						if (!result.length) {
							return res.status(200).send({
								msg: "Email or password is incorrect!",
							});
						}
						// check password
						bcrypt.compare(
							req.body.password,
							result[0]["password"],
							(bErr, bResult) => {
								// wrong password
								if (bErr) {
									throw bErr;
									return res.status(200).send({
										msg: "Email or password is incorrect!",
									});
								}
								if (bResult) {
									let session = req.session;
									const token = jwt.sign(
										{
											id: result[0].id,
											email: result[0].email,
											location: result[0].location,
											designation: result[0].designation,
										},
										JWTKEY,
										{
											expiresIn: "1h",
										}
									);
									let updateQuery =
										"UPDATE GWR.users SET last_login = now(),incorrect_password_attempts = 0 WHERE id = ?;";
									con.query(updateQuery, [result[0].id]);
									return res.status(200).json({
										token: token,
										session: session,
										name: result[0]["name"],
									});
								} else {
									let updateQuery2 =
										"UPDATE GWR.users SET incorrect_password_attempts = incorrect_password_attempts + 1 ,last_incorrect_login = now() WHERE id = ?;";
									con.query(updateQuery2, [result[0].id]);
								}
								return res.status(200).send({
									msg: "Email or password is incorrect!",
								});
							}
						);
					});
				} else {
					return res.status(400).send({
						msg: "Recaptcha Verification Failed!",
					});
				}
			})
			.catch((error) => {
				return res.status(400).send({
					msg: "Invalid Recaptcha!",
				});
			});
	}
};

module.exports.resetPassword = (req, res) => {
	const { id, newPassword } = req.body;
	let passwordRegex = new RegExp(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
	);
	if (passwordRegex.test(newPassword)) {
		let resetPasswordQuery =
			"SELECT id,name,email,access,last_login FROM GWR.users WHERE id = ?";
		con.query(resetPasswordQuery, [id], (err, result) => {
			// user does not exists
			if (err) {
				throw err;
				return res.status(400).send({
					msg: err,
				});
			}
			if (!result.length) {
				return res.status(200).send({
					msg: "id or password is incorrect!",
				});
			} else {
				bcrypt.hash(newPassword, 10, (err, hash) => {
					if (err) {
						return res.status(500).send({
							msg: err,
						});
					} else {
						let passwordUpdateQuery = "UPDATE GWR.users SET password=? where id= ? ;";
						// has hashed pw => add to database
						con.query(passwordUpdateQuery, [hash, result[0].id], (err, result) => {
							if (err) {
								throw err;
								return res.status(400).send({
									msg: err,
								});
							}
							return res.status(201).send({
								msg: "The user password has been updated with us!",
							});
						});
					}
				});
			}
		});
	} else {
		res.status(400).json({
			message:
				"Password must be 8 character long or more and has one Uppercase,One LowerCase,One Digit and a special Character.",
		});
	}
};

module.exports.resetOldPassword = (req, res) => {
	const { email, oldPassword, newPassword } = req.body;
	let passwordRegex = new RegExp(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
	);
	if (passwordRegex.test(newPassword)) {
		let resetPasswordQuery =
			"SELECT id,name,email,access,last_login FROM GWR.users WHERE email = ?";
		con.query(resetPasswordQuery, [email], (err, result) => {
			// user does not exists
			if (err) {
				throw err;
				return res.status(400).send({
					msg: err,
				});
			}
			if (!result.length) {
				return res.status(200).send({
					msg: "Email or password is incorrect!",
				});
			} else {
				bcrypt.hash(newPassword, 10, (err, hash) => {
					if (err) {
						return res.status(500).send({
							msg: err,
						});
					} else {
						let passwordUpdateQuery =
							"UPDATE GWR.users SET password=? where email= ? ;";
						// has hashed pw => add to database
						con.query(passwordUpdateQuery, [hash, result[0].email], (err, result) => {
							if (err) {
								throw err;
								return res.status(400).send({
									msg: err,
								});
							}
							return res.status(201).send({
								msg: "The user password has been updated with us!",
							});
						});
					}
				});
			}
		});
	} else {
		res.status(400).json({
			message:
				"Password must be 8 character long or more and has one Uppercase,One LowerCase,One Digit and a special Character.",
		});
	}
};

const userCredentials = {
	username: "admin",
	password: "admin123",
	email: "admin@gmail.com",
};

module.exports.login2 = (req, res) => {
	const { email } = req.body;


	let loginSqlQuery = `SELECT id,name,email,password,access,last_login,location,designation FROM GWR.users WHERE email = ? and incorrect_password_attempts < 5;`;
	con.query(loginSqlQuery, [email], (err, result) => {

     

		let  location  = result[0];

	 
		// user does not exists
		if (err) {
			//throw err;
			return res.status(400).send({
				msg: "Email or password is incorrect!",
			});
		}
		if (!result.length) {
			return res.status(200).send({
				msg: "Email or password is incorrect!",
			});
		}
		// check password
		bcrypt.compare(req.body.password, result[0]["password"], (bErr, bResult) => {
			// wrong password
			if (bErr) {
				throw bErr;
				return res.status(200).send({
					msg: "Email or password is incorrect!",
				});
			}
			if (bResult) {
				const accessToken = jwt.sign({ email: email, location }, "accessSecret", {
					expiresIn: "20m",
				});
				const refreshToken = jwt.sign({ email: email, location }, "refreshSecret", {
					expiresIn: "20m",
				});
				let updateQuery =
					"UPDATE GWR.users SET last_login = now(),incorrect_password_attempts = 0 WHERE id = ?;";
				con.query(updateQuery, [result[0].id]);
				//Ps. The expiresIn time is just for testing purpose you can    change it later accordingly.
				return res.status(200).json({ accessToken, refreshToken });
			} else {
				let updateQuery2 =
					"UPDATE GWR.users SET incorrect_password_attempts = incorrect_password_attempts + 1 ,last_incorrect_login = now() WHERE id = ?;";
				con.query(updateQuery2, [result[0].id]);
			}
			return res.status(200).send({
				msg: "Email or password is incorrect!",
			});
		});


	});
};

module.exports.refresh = (req, res) => {
	const { refreshToken } = req.body;
	const isValid = verifyRefresh(refreshToken);
	const accessToken = jwt.sign({ email: isValid }, "accessSecret", {
		expiresIn: "20m",
	});
	return res.status(200).json({ success: true, accessToken });
};


module.exports.getoutletbylocation = (req, res) => {
	
	//let sqlQuery =
	//		"select id,name from GWR.outlets where location = ?;";

	let sqlQuery = `SELECT id,name
FROM GWR.outlets
WHERE location = ?
ORDER BY
    CASE
        WHEN name = 'Front Desk' THEN 0
        ELSE 1
    END, name;`
		let data = connection.query(sqlQuery, [req.query.location]);

	return res.status(200).json({ success: true, data:data });
};


module.exports.getoutletidbylocationandoutletname = (req, res) => {
	
	//let sqlQuery =
	//		"select id,name from GWR.outlets where location = ?;";

	let sqlQuery = `SELECT id,name
FROM GWR.outlets
WHERE location = ?
AND name = ?;`
		let data = connection.query(sqlQuery, [req.query.location,req.query.outlet_name]);

	return res.status(200).json({ success: true, data:data });
};
