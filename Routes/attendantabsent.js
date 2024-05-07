const express = require("express");
const Router = express.Router();
const attendantabsentController = require("../Controllers/attendantabsent");
const { locationCheck } = require("../middlewares/locationCheck");
const { isAuthenticated } = require("../middlewares/helper");
///Santized Apis
Router.get(
	"/get_table_data",
	isAuthenticated,
	attendantabsentController.get_table_data
); //

module.exports = Router;
