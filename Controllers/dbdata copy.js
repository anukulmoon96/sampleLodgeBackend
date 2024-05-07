const moment = require("moment/moment");
var connection = require("../Config/db");
const validator = require("validator");

Date.prototype.addDays = function (days) {
	var date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};

function getDates(startDate, endDate) {
	const dates = [];
	let currentDate = startDate;
	const addDays = function (days) {
		const date = new Date(this.valueOf());
		date.setDate(date.getDate() + days);
		return date;
	};
	while (currentDate <= endDate) {
		dates.push(currentDate);
		currentDate = addDays.call(currentDate, 1);
	}
	return dates;
}

function convertDate(today) {
	var dd = String(today.getDate()).padStart(2, "0");
	var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
	var yyyy = today.getFullYear();
	return yyyy + "-" + mm + "-" + dd;
}

module.exports.timeVsAvgServiceTime_2 = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let location = req.query.location;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let finaldata = [];

		dates2.map((item) => {
			let sqlQuery =
				'select date, concat(substr(time,1,2),":30") as time, location, avg(TIME_TO_SEC(avg_service_time)/60) as avg_service_time from GWR.gwr_reg_stats where date = ? and location in (?) group by date, location, substr(time,1,2) order by date desc,time asc;';
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery, [item, location])
					.map((data2) => data2.avg_service_time.toFixed(2)),
			});
		});
		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.timeVsAvgServiceTime_u = (req, res) => {
	let dateOne = req.query.dateOne;
	let dateTwo = req.query.dateTwo;
	let location = req.query.location;
	if (validator.isDate(dateOne) && validator.isDate(dateTwo)) {
		let dates2 = [dateOne, dateTwo];

		let finaldata = [];

		dates2.map((item) => {
			let sqlQuery =
				'select date, concat(substr(time,1,2),":30") as time, location, avg(TIME_TO_SEC(avg_service_time)/60) as avg_service_time from GWR.gwr_reg_stats where date = ? and location in (?) group by date, location, substr(time,1,2) order by date desc,time asc;';
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery, [item, location])
					.map((data2) => data2.avg_service_time.toFixed(2)),
			});
		});
		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.timeVsAvgWaitTimeQueue1_2 = (req, res) => {
	const { startDate, endDate, location } = req.query;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let finaldata = [];

		dates2.map((item) => {
			let sqlQuery =
				'select date, concat(substr(time,1,2),":30") as time, location, CONVERT(avg(TIME_TO_SEC(avg_wait_time_queue1)/60),DECIMAL(10,2)) as avg_wait_time_queue1 from GWR.gwr_reg_stats where date = ? and location in (?) group by date, location, substr(time,1,2) order by date desc,time asc;';
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery, [item, location])
					.map((data2) => data2.avg_wait_time_queue1),
			});
		});
		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.timeVsAvgWaitTimeQueue1_u = (req, res) => {
	const { dateOne, dateTwo, location } = req.query;
	if (validator.isDate(dateOne) && validator.isDate(dateTwo)) {
		let dates2 = [dateOne, dateTwo];

		let finaldata = [];

		dates2.map((item) => {
			let sqlQuery =
				'select date, concat(substr(time,1,2),":30") as time, location, avg(TIME_TO_SEC(avg_wait_time_queue1)/60) as avg_wait_time_queue1 from GWR.gwr_reg_stats where date = ? and location in (?) group by date, location, substr(time,1,2) order by date desc,time asc;';
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery, [item, location])
					.map((data2) => data2.avg_wait_time_queue1.toFixed(2)),
			});
		});
		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.timeVsQueueLength1_2 = (req, res) => {
	const { startDate, endDate, location } = req.query;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let finaldata = [];
		dates2.map((item) => {
			let sqlQuery =
				'select date, concat(substr(time,1,2),":30") as time, location, CEILING(avg(queue_length_1)) as queue_length_1 from GWR.gwr_reg_stats where date = ? and location in (?) group by date, location, substr(time,1,2) order by date desc,time asc;';
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery, [item, location])
					.map((data2) => data2.queue_length_1),
			});
		});
		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.timeVsQueueLength1_u = (req, res) => {
	const { dateOne, dateTwo, location } = req.query;
	if (validator.isDate(dateOne) && validator.isDate(dateTwo)) {
		let dates2 = [dateOne, dateTwo];
		let finaldata = [];
		dates2.map((item) => {
			let sqlQuery =
				'select date, concat(substr(time,1,2),":30") as time, location, CEILING(avg(queue_length_1)) as queue_length_1 from GWR.gwr_reg_stats where date = ? and location in (?) group by date, location, substr(time,1,2) order by date desc,time asc;';
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery, [item, location])
					.map((data2) => data2.queue_length_1),
			});
		});
		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.timeVsAvgServiceTimeForBucketPool_2 = (req, res) => {
	const { startDate, endDate, location } = req.query;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let finalresult = [];
		dates2.map((item) => {
			let sqlQuery =
				'select date, concat(substr(time,1,2),":30") as time, location, avg(TIME_TO_SEC(avg_service_time)) as avg_service_time from GWR.gwr_bucket_pool where date = ? and location in (?) group by date, location, substr(time,1,2) order by date desc,time asc;';
			finalresult.push({
				name: item,
				data: connection
					.query(sqlQuery, [item, location])
					.map((data2) => data2.avg_service_time.toFixed(2)),
			});
		});
		res.status(200).json({ message: "List", data: finalresult });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.timeVsAvgServiceTimeForBucketPool_u = (req, res) => {
	const { dateOne, dateTwo, location } = req.query;
	if (validator.isDate(dateOne) && validator.isDate(dateTwo)) {
		let dates2 = [dateOne, dateTwo];

		let finalresult = [];
		dates2.map((item) => {
			let sqlQuery =
				'select date, concat(substr(time,1,2),":30") as time, location, avg(TIME_TO_SEC(avg_service_time)) as avg_service_time from GWR.gwr_bucket_pool where date = ? and location in (?) group by date, location, substr(time,1,2) order by date desc,time asc;';
			finalresult.push({
				name: item,
				data: connection
					.query(sqlQuery, [item, location])
					.map((data2) => data2.avg_service_time.toFixed(2)),
			});
		});
		res.status(200).json({ message: "List", data: finalresult });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.users = (req, res) => {
	let sqlQuery = "select id,name,email,access,last_login from GWR.users";
	let data = connection.query(sqlQuery);

	res.status(200).json({ message: "Userslist List", data: data });
};

module.exports.attendentabsent = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let location = req.query.location;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		var d = new Date(startDate);
		d.setDate(d.getDate() - 7);
		var curr_date = d.getDate();
		var curr_month = d.getMonth();
		var curr_year = d.getFullYear();
		var current =
			curr_year + "-" + ("0" + (curr_month + 1)).slice(-2) + "-" + curr_date;
		let sqlQuery =
			"select id,date,time,image,location,desk_number,camera_id from GWR.gwr_alerts_desk where date between ? and ? and location = ? order by date desc, time desc;";
		let data = connection.query(sqlQuery, [startDate, endDate, location]);

		res.status(200).json({ message: "Attendent absent  List", data: data });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.footfalllinegraph2 = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let location = req.query.location;
	let outlet = req.query.outlet;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});
		let finaldata = [];

		dates2.map((item) => {
			let sqlQuery = `select date,concat(substr(time,1,2),":30") as time, location, sum(footfall) as difference
from GWR.Footfall
where date = ? and location in (?) and outlet = ?
group by date, location, substr(time,1,2)
order by date asc, time asc;`;
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery, [item, location, outlet])
					.map((data2) => data2.difference),
			});
		});

		res.status(200).json({ message: "Attendent absent  List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.footfalllinegraph2_u = (req, res) => {
	let dateOne = req.query.dateOne;
	let dateTwo = req.query.dateTwo;
	let location = req.query.location;
	let outlet = req.query.outlet;
	if (validator.isDate(dateOne) && validator.isDate(dateTwo)) {
		let dates2 = [dateOne, dateTwo];
		console.log(dates2);

		let finaldata = [];

		dates2.map((item) => {
			let sqlQuery =
				'select date,concat(substr(time,1,2),":30") as time, location, sum(footfall) as difference from GWR.Footfall where date = ? and location in (?) and outlet = ? group by date, location, substr(time,1,2) order by date asc, time asc;';
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery, [item, location, outlet])
					.map((data2) => data2.difference),
			});
		});

		res.status(200).json({ message: "Attendent absent  List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.alertslinegraph = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let location = req.query.location;

	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		var d = new Date(startDate);
		d.setDate(d.getDate() - 7);
		var curr_date = d.getDate();
		var curr_month = d.getMonth();
		var curr_year = d.getFullYear();
		var current =
			curr_year + "-" + ("0" + (curr_month + 1)).slice(-2) + "-" + curr_date;

		let sqlQuery =
			"SELECT id,date,time,image,location,camera_id,desk_number,count(*) as count FROM GWR.gwr_alerts_desk where date between ? and ? and location = ?  group by date;";

		let data = connection.query(sqlQuery, [startDate, endDate, location]);
		res.status(200).json({ message: "Alerts count List", data: data });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.footfalldatewise = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let location = req.query.location;
	let outlet = req.query.outlet;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let sqlQuery =
			"select date, location, sum(footfall) as footfall from GWR.Footfall where date between ? and ? and location in (?) and outlet = ? group by date, location order by date asc;";

		let data = connection.query(sqlQuery, [startDate, endDate, location, outlet]);

		res.status(200).json({ message: "Alerts count List", data: data });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.footfalldatewise_u = (req, res) => {
	let dateOne = req.query.dateOne;
	let dateTwo = req.query.dateTwo;
	let location = req.query.location;
	let outlet = req.query.outlet;

	if (validator.isDate(dateOne) && validator.isDate(dateTwo)) {
		let sqlQueryOne =
			"select date, location, sum(footfall) as footfall from GWR.Footfall where date = ? and location in (?) and outlet = ? group by date, location order by date asc;";
		let sqlQueryTwo =
			"select date, location, sum(footfall) as footfall from GWR.Footfall where date = ? and location in (?) and outlet = ? group by date, location order by date asc;";

		let data1 = connection.query(sqlQueryOne, [dateOne, location, outlet]);

		let data2 = connection.query(sqlQueryTwo, [dateTwo, location, outlet]);

		let data3 = [...data1, ...data2];

		res.status(200).json({ message: "Alerts count List", data: data3 });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};
