const express = require("express");
const Router = express.Router();
const extremeeventsController = require("../Controllers/extremeevents");
const { locationCheck } = require("../middlewares/locationCheck");
const { isAuthenticated } = require("../middlewares/helper");
///Santized Apis
Router.get(
	"/get_table_data",
	isAuthenticated,
	extremeeventsController.get_table_data
); //

Router.get(
	"/get_table_data2",
	isAuthenticated,
	extremeeventsController.get_table_data2
); //

module.exports = Router;
