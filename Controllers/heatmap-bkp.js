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

module.exports.gwr_reg_stats = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let outlet = req.query.outlet;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let finaldata = [];
        

		dates2.map((item) => {

			let sqlQuery = '';

			if(outlet == 6 || outlet == 10 || outlet == 14){

            
			//let sqlQuery =
			//	`SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date," ",time)) /15) * 15 minute) AS login_datetime_15_min_interval, avg(TIME_TO_SEC(avg_service_time)/60) AS service_time FROM GWR.gwr_reg_stats where date = '${item}'  and location = '${location}' and time between '08:40:00' and '21:40:00' GROUP BY login_datetime_15_min_interval ORDER BY login_datetime_15_min_interval`;
		sqlQuery = `SELECT DATE_ADD("1000-01-01 00:00:00",
		            Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00",
					 concat(date_format(created_at, '%Y-%m-%d')," ",date_format(created_at, '%H:%i:%s'))) /15) * 15 minute) AS login_datetime_15_min_interval,
					  avg(TIME_TO_SEC(service_time)/60) AS service_time 
					  FROM GWR.Queue_matrix where created_at like '%${item}%' 
					   and outlet = '${outlet}' and concat(date_format(created_at, '%H:%i:%s')) between 
					   '06:30:00' and '17:40:00' GROUP BY login_datetime_15_min_interval ORDER BY
					    login_datetime_15_min_interval`;

			}
			else if(outlet == 19){
			
				sqlQuery = `SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date_format(created_at, '%Y-%m-%d')," ",date_format(created_at, '%H:%i:%s'))) /15) * 15 minute) AS login_datetime_15_min_interval, avg(TIME_TO_SEC(service_time)/60) AS service_time FROM GWR.Queue_matrix where created_at like '%${item}%'  and outlet = '${outlet}' and concat(date_format(created_at, '%H:%i:%s')) between '06:30:00' and '20:40:00' GROUP BY login_datetime_15_min_interval ORDER BY login_datetime_15_min_interval`;

		
				}
			
			else{

		 sqlQuery = `SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date_format(created_at, '%Y-%m-%d')," ",date_format(created_at, '%H:%i:%s'))) /15) * 15 minute) AS login_datetime_15_min_interval, avg(TIME_TO_SEC(service_time)/60) AS service_time FROM GWR.Queue_matrix where created_at like '%${item}%'  and outlet = '${outlet}' and concat(date_format(created_at, '%H:%i:%s')) between '08:30:00' and '22:40:00' GROUP BY login_datetime_15_min_interval ORDER BY login_datetime_15_min_interval`;

			}




			
 			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery)
					.map((data2) => data2.service_time.toFixed(2)),
			});
		});
		res.status(200).json({ message: "List", data: finaldata });


//optimized










	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.wait_time = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let outlet = req.query.outlet;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let finaldata = [];
        

		dates2.map((item) => {
            
			// let sqlQuery =
			// 	`SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date,' ',time)) / 15) * 15 minute) AS login_datetime_15_min_interval,
            //     avg(TIME_TO_SEC(avg_wait_time_queue1)/60) AS wait_time
            // FROM GWR.gwr_reg_stats where date = '${item}' and location = '${location}' and time between '08:40:00' and '21:30:00'
            // GROUP BY login_datetime_15_min_interval
            // ORDER BY login_datetime_15_min_interval;`;

			let sqlQuery = '';
			if(outlet == 6 || outlet == 10 || outlet == 14){

			 sqlQuery = `SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
			avg(TIME_TO_SEC(service_time)/60)*queue_length AS wait_time
		FROM GWR.Queue_matrix where created_at like '%${item}%' and outlet = '${outlet}'  and date_format(created_at, '%H:%i:%s') between '06:30:00' and '17:40:00'
		GROUP BY login_datetime_15_min_interval
		ORDER BY login_datetime_15_min_interval;`;

			}
			
			else if(outlet == 19){
			
				sqlQuery = `SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
				avg(TIME_TO_SEC(service_time)/60)*queue_length AS wait_time
			FROM GWR.Queue_matrix where created_at like '%${item}%' and outlet = '${outlet}'  and date_format(created_at, '%H:%i:%s') between '06:30:00' and '20:40:00'
			GROUP BY login_datetime_15_min_interval
			ORDER BY login_datetime_15_min_interval;`;
		
				}
			
			else{

			 sqlQuery = `SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
				avg(TIME_TO_SEC(service_time)/60)*queue_length AS wait_time
			FROM GWR.Queue_matrix where created_at like '%${item}%' and outlet = '${outlet}'  and date_format(created_at, '%H:%i:%s') between '08:30:00' and '22:40:00'
			GROUP BY login_datetime_15_min_interval
			ORDER BY login_datetime_15_min_interval;`;
				
			}
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery)
					.map((data2) => data2.wait_time.toFixed(2)),
			});
		});
		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};



module.exports.queue_length = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let outlet = req.query.outlet;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let finaldata = [];
        

		dates2.map((item) => {
            
			// let sqlQuery =
			// 	`SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date,' ',time)) / 15) * 15 minute) AS login_datetime_15_min_interval,
			// 	avg(queue_length_1) AS queue_length
			// FROM GWR.gwr_reg_stats where date = '${item}' and location = '${location}' and time between '08:40:00' and '21:30:00'
			// GROUP BY login_datetime_15_min_interval
			// ORDER BY login_datetime_15_min_interval;`;
			let sqlQuery = '';
			if(outlet == 6 || outlet == 10 || outlet == 14){
		 sqlQuery = `SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
			avg(queue_length) AS queue_length
		FROM GWR.Queue_matrix where created_at like '%${item}%' and outlet = ${outlet} and date_format(created_at, '%H:%i:%s') between '06:30:00' and '17:40:00'
		GROUP BY login_datetime_15_min_interval
		ORDER BY login_datetime_15_min_interval;`;

			}
			
			else if(outlet == 19){
			
				sqlQuery = `SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
				avg(queue_length) AS queue_length
			FROM GWR.Queue_matrix where created_at like '%${item}%' and outlet = ${outlet} and date_format(created_at, '%H:%i:%s') between '06:30:00' and '20:40:00'
			GROUP BY login_datetime_15_min_interval
			ORDER BY login_datetime_15_min_interval;`;
		
				}
			else{
				 sqlQuery = `SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
				avg(queue_length) AS queue_length
			FROM GWR.Queue_matrix where created_at like '%${item}%' and outlet = ${outlet} and date_format(created_at, '%H:%i:%s') between '08:30:00' and '22:40:00'
			GROUP BY login_datetime_15_min_interval
			ORDER BY login_datetime_15_min_interval;`;

			}
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery)
					.map((data2) => data2.queue_length.toFixed(2)),
			});
		});
		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};



module.exports.bucket_pool = (req, res) => {
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


			let sqlQuery = '';
			if(outlet == 6 || outlet == 10 || outlet == 14){
            
			sqlQuery =
				`SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date,' ',time)) / 15) * 15 minute) AS login_datetime_15_min_interval,
				avg(TIME_TO_SEC(avg_service_time)) AS service_time
			FROM GWR.gwr_bucket_pool where date =  '${item}' and location = '${location}' and time between '06:30:00' and '17:40:00'
			GROUP BY login_datetime_15_min_interval
			ORDER BY login_datetime_15_min_interval;`;

			}
			else if(outlet == 19){
			
				sqlQuery =
				`SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date,' ',time)) / 15) * 15 minute) AS login_datetime_15_min_interval,
				avg(TIME_TO_SEC(avg_service_time)) AS service_time
			FROM GWR.gwr_bucket_pool where date =  '${item}' and location = '${location}' and time between '06:30:00' and '20:40:00'
			GROUP BY login_datetime_15_min_interval
			ORDER BY login_datetime_15_min_interval;`;
		
				}
			
			else{

				 sqlQuery =
				`SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date,' ',time)) / 15) * 15 minute) AS login_datetime_15_min_interval,
				avg(TIME_TO_SEC(avg_service_time)) AS service_time
			FROM GWR.gwr_bucket_pool where date =  '${item}' and location = '${location}' and time between '08:30:00' and '22:40:00'
			GROUP BY login_datetime_15_min_interval
			ORDER BY login_datetime_15_min_interval;`;
			}
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery)
					.map((data2) => data2.service_time.toFixed(2)),
			});
		});
		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};



module.exports.footfall = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let outlet = req.query.outlet;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let finaldata = [];
        

		dates2.map((item) => {
            
			// let sqlQuery =
			// 	`SELECT DATE_ADD('1000-01-01 00:00:00', Interval CEILING(TIMESTAMPDIFF(MINUTE,'1000-01-01 00:00:00', concat(date,' ',time)) / 15) * 15 minute) AS login_datetime_15_min_interval,
			// 	ceiling(FootFall) AS service_time
			// FROM GWR.Footfall where date = '${item}' and location = '${location}' and time between '8:30:00' and '21:40:00'
			// GROUP BY login_datetime_15_min_interval
			// ORDER BY login_datetime_15_min_interval;`;
			let sqlQuery = '';
			if(outlet == 6 || outlet == 10 || outlet == 14){
            
			sqlQuery = `SELECT DATE_ADD('1000-01-01 00:00:00', Interval CEILING(TIMESTAMPDIFF(MINUTE,'1000-01-01 00:00:00', concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
			ceiling(count) AS service_time
		FROM GWR.footfall where created_at like '%${item}%' and outlet = ${outlet} and date_format(created_at, '%H:%i:%s') between '06:30:00' and '17:40:00'
		GROUP BY login_datetime_15_min_interval
		ORDER BY login_datetime_15_min_interval;`;

			}
			else if(outlet == 19){
			
				sqlQuery = `SELECT DATE_ADD('1000-01-01 00:00:00', Interval CEILING(TIMESTAMPDIFF(MINUTE,'1000-01-01 00:00:00', concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
			ceiling(count) AS service_time
		FROM GWR.footfall where created_at like '%${item}%' and outlet = ${outlet} and date_format(created_at, '%H:%i:%s') between '06:30:00' and '20:40:00'
		GROUP BY login_datetime_15_min_interval
		ORDER BY login_datetime_15_min_interval;`;
		
				}
			
			else{


			 sqlQuery = `SELECT DATE_ADD('1000-01-01 00:00:00', Interval CEILING(TIMESTAMPDIFF(MINUTE,'1000-01-01 00:00:00', concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
				ceiling(count) AS service_time
			FROM GWR.footfall where created_at like '%${item}%' and outlet = ${outlet} and date_format(created_at, '%H:%i:%s') between '08:30:00' and '22:40:00'
			GROUP BY login_datetime_15_min_interval
			ORDER BY login_datetime_15_min_interval;`;
			}


			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery)
					.map((data2) => data2.service_time.toFixed(2)),
			});
		});
		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};



module.exports.heatmap_api = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let outlet = req.query.outlet;


	let sql = `SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
	convert(avg(TIME_TO_SEC(service_time)/60),DECIMAL(10,2)) AS service_time,
	round(avg(queue_length)) AS queue_length,
	convert(avg(TIME_TO_SEC(service_time)/60)*round(avg(queue_length)),Decimal(10,2)) AS wait_time
	FROM GWR.Queue_matrix where created_at between '${startDate} 08:30:00' and '${endDate} 23:00:00' and outlet = ${outlet} and date_format(created_at, '%H:%i:%s')
	GROUP BY login_datetime_15_min_interval
	ORDER BY login_datetime_15_min_interval;`;

	
let data = connection.query(sql);




// res.status(200).json(data);

// return;

const serviceTimeData = {};
const waitTimeData = {};
const queueLengthData = {};
// Process the data
data.forEach(entry => {
  const datetime = entry.login_datetime_15_min_interval;
  const date = datetime.split(" ")[0];
  const time = datetime.split(" ")[1];

  // Initialize arrays if not present
  if (!serviceTimeData[date]) serviceTimeData[date] = [];
  if (!waitTimeData[date]) waitTimeData[date] = [];
  if (!queueLengthData[date]) queueLengthData[date] = [];
  // Push values to respective arrays



  if(time >= '08:30:00' && time <= '23:00:00'){


		serviceTimeData[date].push(entry.service_time);

	

	waitTimeData[date].push(entry.wait_time);
	queueLengthData[date].push(entry.queue_length);
  }

});


// Convert objects to arrays
const serviceTimeArray = Object.entries(serviceTimeData).map(([date, data]) => ({ name: date, data: data }));
//const waitTimeArray = Object.entries(waitTimeData).map(([date, data]) => ({ name: date, data1: data }));
// const queueLengthArray = Object.entries(queueLengthData).map(([date, data]) => ({ name: date1, y: data }));
// console.log("Service Time Data:", serviceTimeArray);
// console.log("Wait Time Data:", waitTimeArray);
// console.log("Queue Length Data:", queueLengthArray);

res.status(200).json({ message: "List", data: serviceTimeArray });




};