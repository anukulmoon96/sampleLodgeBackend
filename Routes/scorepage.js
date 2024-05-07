const express = require("express");
const Router = express.Router();
const scorepageController = require("../Controllers/scorepage");
const { locationCheck } = require("../middlewares/locationCheck");
const { isAuthenticated } = require("../middlewares/helper");
///Santized Apis
Router.get(
	"/score",
	isAuthenticated,
	scorepageController.score
); //
Router.get(
	"/score2",
	isAuthenticated,
	scorepageController.score2
); //

Router.get(
	"/score3",
	isAuthenticated,
	scorepageController.score3
); //


Router.get(
	"/getlinegraphdata",
	isAuthenticated,
	scorepageController.getlinegraphdata
); //


Router.get(
	"/getguestservicestabledata",
	isAuthenticated,
	scorepageController.getguestservicestabledata
); //


Router.get(
	"/getfandbtabledata",
	isAuthenticated,
	scorepageController.getfandbtabledata
); //
Router.get(
	"/getfandbareatabledata",
	isAuthenticated,
	scorepageController.getfandbareatabledata
); 

Router.get(
	"/score4",
	isAuthenticated,
	scorepageController.score4
); //

Router.get(
	"/scorecalculationdata",
	isAuthenticated,
	scorepageController.scorecalculationdata
); //
module.exports = Router;
