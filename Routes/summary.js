const express = require("express");
const Router = express.Router();
const summaryController = require("../Controllers/summary");
const { locationCheck } = require("../middlewares/locationCheck");
const { isAuthenticated } = require("../middlewares/helper");
///Santized Apis
Router.get(
	"/get_lodges",
	isAuthenticated,
	summaryController.get_lodges
); //


Router.get("/getaverageservicetimebyid",
summaryController.getaverageservicetimebyid)


Router.get("/getmaxservicetimebyid",
summaryController.getmaxservicetimebyid)


Router.get("/getaverageexpectedwaittimebyid",
summaryController.getaverageexpectedwaittimebyid)


Router.get("/getmaxexpectedwaittimebyid",
summaryController.getmaxexpectedwaittimebyid)

Router.get("/getallsummarydata",
summaryController.getallsummarydata)
module.exports = Router;
