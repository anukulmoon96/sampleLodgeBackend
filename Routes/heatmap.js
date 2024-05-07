const express = require("express");
const Router = express.Router();
const heatmapController = require("../Controllers/heatmap");
const { locationCheck } = require("../middlewares/locationCheck");
const { isAuthenticated } = require("../middlewares/helper");
///Santized Apis
Router.get(
	"/gwr_reg_stats",
	isAuthenticated,
	locationCheck,
	heatmapController.gwr_reg_stats
); //

Router.get(
	"/gwr_reg_stats2",
	isAuthenticated,
	locationCheck,
	heatmapController.gwr_reg_stats2
); //
Router.get(
	"/wait_time",
	isAuthenticated,
	locationCheck,
	heatmapController.wait_time
); //
Router.get(
	"/queue_length",
	isAuthenticated,
	locationCheck,
	heatmapController.queue_length
); //
Router.get(
	"/bucket_pool",
	isAuthenticated,
	locationCheck,
	heatmapController.bucket_pool
);
Router.get(
	"/footfall",
	isAuthenticated,
	locationCheck,
	heatmapController.footfall
);

Router.get("/heatmap_api",
heatmapController.heatmap_api

)

Router.get("/heatmap_api_footfall",
heatmapController.heatmap_api_footfall

)

module.exports = Router;
