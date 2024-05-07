const express = require("express");
const Router = express.Router();
const AuthController = require("../Controllers/Auth");
const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const Securitykey = crypto.randomBytes(32);
const initVector = crypto.randomBytes(16);
const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
const { locationCheck } = require("../middlewares/locationCheck");
const { isAuthenticated } = require("../middlewares/helper");
const { encryptData, decryptData } = require("../utils/encrypt");

Router.post("/login", AuthController.login);
Router.post("/signup", AuthController.signup);
Router.post("/resetpassword", AuthController.resetPassword);
Router.patch("/oldpasswordupdate", AuthController.resetOldPassword);
Router.post("/login2", AuthController.login2);
Router.post("/refresh", AuthController.refresh);

Router.get("/testAuth", isAuthenticated, locationCheck, (req, res) => {
	let encryptedData = encryptData(req.body);
	console.log(encryptedData);
	let decryptedData = decryptData(encryptedData);
	console.log(decryptedData);
	res.send("test Auth is responding");
});

Router.get("/getoutletbylocation", isAuthenticated,AuthController.getoutletbylocation);

Router.get("/getoutletidbylocationandoutletname", isAuthenticated,AuthController.getoutletidbylocationandoutletname);

module.exports = Router;
