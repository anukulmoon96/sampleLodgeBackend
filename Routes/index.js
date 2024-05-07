const express = require("express");
const Router = express.Router();

const AuthRoutes = require("../Routes/Auth");
const dbStatsRoutes = require("../Routes/dbStats");
const heatmapRoutes = require("../Routes/heatmap");
const newapisRoutes = require("../Routes/newapis");
const summaryRoutes = require("../Routes/summary");
const scorepageRoutes = require("../Routes/scorepage");
const camerahealthRoutes = require("../Routes/camerahealth");
const extremeeventsRoutes = require("../Routes/extremeevents");
const attendantabsentRoutes = require("../Routes/attendantabsent");

Router.use("/Auth", AuthRoutes);
Router.use("/stats", dbStatsRoutes);
Router.use("/summary", summaryRoutes);
Router.use("/camerahealth", camerahealthRoutes);
Router.use("/extremeevents", extremeeventsRoutes);
Router.use("/attendantabsent", attendantabsentRoutes);
Router.use("/heatmap", heatmapRoutes);
Router.use("/newapis", newapisRoutes);
Router.use("/scorepage",scorepageRoutes);


module.exports = Router;
