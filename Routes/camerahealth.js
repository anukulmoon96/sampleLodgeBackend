const express = require("express");
const Router = express.Router();
const camerahealthController = require("../Controllers/camerahealth");
const { locationCheck } = require("../middlewares/locationCheck");
const { isAuthenticated } = require("../middlewares/helper");
///Santized Apis
Router.get(
	"/health",
	isAuthenticated,
	camerahealthController.health
); //health

module.exports = Router;
