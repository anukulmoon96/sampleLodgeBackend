const express = require("express");
const Router = express.Router();
const dbDataController = require("../Controllers/dbdata");
const { locationCheck } = require("../middlewares/locationCheck");
const { isAuthenticated } = require("../middlewares/helper");

///Santized Apis
Router.get(
	"/timeVsAvgServiceTime_2",
	isAuthenticated,
	locationCheck,
	dbDataController.timeVsAvgServiceTime_2
); //
Router.get(
	"/timeVsAvgServiceTime_u",
	isAuthenticated,
	locationCheck,
	dbDataController.timeVsAvgServiceTime_u
); //
Router.get(
	"/timeVsAvgWaitTimeQueue1_2",
	isAuthenticated,
	locationCheck,
	dbDataController.timeVsAvgWaitTimeQueue1_2
); //
Router.get(
	"/timeVsAvgWaitTimeQueue1_u",
	isAuthenticated,
	locationCheck,
	dbDataController.timeVsAvgWaitTimeQueue1_u
); //
Router.get(
	"/timeVsQueueLength1_2",
	isAuthenticated,
	locationCheck,
	dbDataController.timeVsQueueLength1_2
); //
Router.get(
	"/timeVsQueueLength1_u",
	isAuthenticated,
	locationCheck,
	dbDataController.timeVsQueueLength1_u
); //
Router.get(
	"/timeVsAvgServiceTimeForBucketPool_2",
	isAuthenticated,
	locationCheck,
	dbDataController.timeVsAvgServiceTimeForBucketPool_2
); //
Router.get(
	"/timeVsAvgServiceTimeForBucketPool_u",
	isAuthenticated,
	locationCheck,
	dbDataController.timeVsAvgServiceTimeForBucketPool_u
); //
Router.get(
	"/footfalllinegraph2",
	isAuthenticated,
	locationCheck,
	dbDataController.footfalllinegraph2
); //
Router.get(
	"/footfalllinegraph2_u",
	isAuthenticated,
	locationCheck,
	dbDataController.footfalllinegraph2_u
); //
Router.get(
	"/alertslinegraph",
	isAuthenticated,
	locationCheck,
	dbDataController.alertslinegraph
); //
Router.get(
	"/footfalldatewise",
	isAuthenticated,
	locationCheck,
	dbDataController.footfalldatewise
); //
Router.get(
	"/footfalldatewise_u",
	isAuthenticated,
	locationCheck,
	dbDataController.footfalldatewise_u
); //

Router.get(
	"/footfalllinegraph2_u_2",
	isAuthenticated,
	locationCheck,
	dbDataController.footfalllinegraph2_u_2
); 

Router.get("/users", isAuthenticated, dbDataController.users); //
Router.get("/entrydata", isAuthenticated, dbDataController.entrydata); //
Router.get("/exitdata", isAuthenticated, dbDataController.exitdata); //
Router.get("/getentrydataforlinegraph",isAuthenticated,
dbDataController.getentrydataforlinegraph)
Router.get("/getexitdataforlinegraph",isAuthenticated,
dbDataController.getexitdataforlinegraph)

Router.post("/adduser", isAuthenticated, dbDataController.addUser);

Router.post("/deleteUser",isAuthenticated, dbDataController.deleteUser);
Router.get(
	"/attendentabsent",
	isAuthenticated,
	dbDataController.attendentabsent
); //

Router.get("/getoutletnamebyid",isAuthenticated,
dbDataController.getoutletnamebyid)

Router.get("/getoutletidbyareanameandlocation",isAuthenticated,dbDataController.getoutletidbyareanameandlocation)


Router.get("/getoutletimages",isAuthenticated,
dbDataController.getoutletimages)

Router.get("/get_all_data",isAuthenticated,
dbDataController.get_all_data)


Router.get("/updatestatus",isAuthenticated,dbDataController.updatestatus)


//UnSantinized Apis and unuseful

// Router.get("/footfall", dbDataController.getFootfall);
// Router.get("/getmaxFootfall", dbDataController.getmaxFootfall);
// Router.get("/alertdesk", dbDataController.getAlertDesk);
// Router.get("/bucketpool", dbDataController.getBucketPool);
// Router.get("/regstats", dbDataController.regStats);
// Router.get("/timeVsAvgServiceTime", dbDataController.timeVsAvgServiceTime);
// Router.get("/timeVsAvgServiceTime2", dbDataController.timeVsAvgServiceTime2);
// Router.get(
// 	"/timeVsAvgWaitTimeQueue1",
// 	dbDataController.timeVsAvgWaitTimeQueue1
// );
// Router.get(
// 	"/timeVsAvgWaitTimeQueue2",
// 	dbDataController.timeVsAvgWaitTimeQueue2
// );
// Router.get("/timeVsQueueLength1", dbDataController.timeVsQueueLength1);

// Router.get("/timeVsQueueLength2", dbDataController.timeVsQueueLength2);
// Router.get(
// 	"/timeVsAvgServiceTimeForBucketPool",
// 	dbDataController.timeVsAvgServiceTimeForBucketPool
// );
// Router.get("/getAlertsDesk", dbDataController.getAlertsDesk);

// Router.get("/footfalllinegraph", dbDataController.footfalllinegraph);

module.exports = Router;
