const express = require("express");
const Router = express.Router();
const newapisController = require("../Controllers/newapis");
const { isAuthenticated } = require("../middlewares/helper");
const { locationCheck } = require("../middlewares/locationCheck");

Router.get(
	"/footfall",
	newapisController.footfalllinegraph
);
Router.get(
	"/footfalldatewise",
	newapisController.footfalldatewise
);
Router.get(
	"/timeVsAvgWaitTimeQueue",
	newapisController.timeVsAvgWaitTimeQueue
);
Router.get(
	"/timeVsQueueLength",
	newapisController.timeVsQueueLength
);
Router.get(
	"/timeVsAvgServiceTime",
	newapisController.timeVsAvgServiceTime
);

Router.get("/get_extreme_events_data",isAuthenticated,
newapisController.get_table_data);


Router.get("/footfalllinegraph2",isAuthenticated,newapisController.footfalllinegraph2);


Router.get('/get_all_data',isAuthenticated,newapisController.get_all_data)

Router.get(
	"/attendentabsent",
	isAuthenticated,
	newapisController.attendentabsent
); //

Router.get('/heatmap_api_queuematrix',isAuthenticated,newapisController.heatmap_api)
Router.get('/heatmap_api_footfall',isAuthenticated,newapisController.heatmap_api_footfall)

module.exports = Router;
