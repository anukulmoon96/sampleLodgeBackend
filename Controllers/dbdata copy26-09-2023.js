const bcrypt = require("bcrypt");
const moment = require("moment/moment");
var connection = require("../Config/db");
const validator = require("validator");
const mysql = require("mysql");
const { encryptData, decryptData } = require("../utils/encrypt");
const e = require("express");
require("dotenv").config();
const { ROUNDS, HOST, USER, PASSWORD, DATABASE, JWTKEY } = process.env;

var con = mysql.createConnection({
	host: HOST,
	user: USER,
	password: PASSWORD,
	database: DATABASE,
	multipleStatements: false,
});

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
	console.log(dates);
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
	let outlet = req.query.outlet;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let finaldata = [];

		let sqlQuery = '';

		//let sqlQuery = `select date, concat(substr(time,1,2),":30") as time, location, avg(TIME_TO_SEC(avg_service_time)/60) as avg_service_time from GWR.gwr_reg_stats where date between (?) and (?) and time between '08:30:00' and '22:30:00' and location in (?) group by date, location, substr(time,1,2) order by time asc;`;\
		 if(outlet == 6 || outlet == 10 || outlet == 14){
			 sqlQuery =  `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet,   CONVERT(avg(TIME_TO_SEC(service_time)/60),DECIMAL(10,2)) as avg_service_time
			from GWR.Queue_matrix
			where created_at between (?) and (?) and outlet = ?
			and date_format(created_at, '%H:%i:%s') between '06:30' and '17:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13)`;
		 }else if(outlet == 19){
			 sqlQuery =  `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet,   CONVERT(avg(TIME_TO_SEC(service_time)/60),DECIMAL(10,2)) as avg_service_time
			from GWR.Queue_matrix
			where created_at between (?) and (?) and outlet = ?
			and date_format(created_at, '%H:%i:%s') between '06:30' and '20:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13)`;

		 }else{
			sqlQuery =  `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet,   CONVERT(avg(TIME_TO_SEC(service_time)/60),DECIMAL(10,2)) as avg_service_time
			from GWR.Queue_matrix
			where created_at between (?) and (?) and outlet = ?
			and date_format(created_at, '%H:%i:%s') between '08:30' and '22:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13)`;


		 }


         




		let data0 = connection.query(sqlQuery, [startDate+" 00:00:00", endDate+" 23:59:59", outlet]);

		dates2.map((item, index1) => {
			finaldata.push({
				name: item,
				data: [],
			});

			data0.map((item2, index2) => {
				if (item == item2.date) {
					finaldata[index1].data.push(item2.avg_service_time.toFixed(2));
				}
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
	let outlet = req.query.outlet;
	if (validator.isDate(dateOne) && validator.isDate(dateTwo)) {
		let dates2 = [dateOne, dateTwo];

		let finaldata = [];

		dates2.map((item) => {
			console.log(item);
		//	let sqlQuery =
		//		'select date, concat(substr(time,1,2),":30") as time, location, avg(TIME_TO_SEC(avg_service_time)/60) as avg_service_time from GWR.gwr_reg_stats where date = ? and location in (?) group by date, location, substr(time,1,2) order by time asc;';
		let sqlQuery = '';

		if(outlet == 6 || outlet == 10 || outlet == 14){

		sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
		concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, CONVERT(avg(TIME_TO_SEC(service_time)/60),DECIMAL(10,2)) as avg_service_time
		from GWR.Queue_matrix
		where created_at like '%${item}%' and outlet = ?
		and date_format(created_at, '%H:%i:%s') between '06:30' and '17:30'
		group by substr(created_at,1,13)
		order by substr(created_at,1,13)`;
		} else if(outlet == 19){
			
		sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
		concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, CONVERT(avg(TIME_TO_SEC(service_time)/60),DECIMAL(10,2)) as avg_service_time
		from GWR.Queue_matrix
		where created_at like '%${item}%' and outlet = ?
		and date_format(created_at, '%H:%i:%s') between '06:30' and '20:30'
		group by substr(created_at,1,13)
		order by substr(created_at,1,13)`;

		}else{
		sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
		concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, CONVERT(avg(TIME_TO_SEC(service_time)/60),DECIMAL(10,2)) as avg_service_time
		from GWR.Queue_matrix
		where created_at like '%${item}%' and outlet = ?
		and date_format(created_at, '%H:%i:%s') between '08:30' and '22:30'
		group by substr(created_at,1,13)
		order by substr(created_at,1,13)`;
		}
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery, [outlet])
					.map((data2) => data2.avg_service_time.toFixed(2)),
			});
		});
		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.timeVsAvgWaitTimeQueue1_2 = (req, res) => {
	const { startDate, endDate, location,outlet } = req.query;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let finaldata = [];

		let sqlQuery = '';
		if(outlet == 6 || outlet == 10 || outlet == 14){

		//let sqlQuery = `select date, concat(substr(time,1,2),":30") as time, location, CONVERT(avg(TIME_TO_SEC(avg_wait_time_queue1)/60),DECIMAL(10,2)) as avg_wait_time_queue1 from GWR.gwr_reg_stats where date between (?) and (?) and time between '08:30:00' and '22:30:00' and location in (?) group by date, location, substr(time,1,2) order by date desc,time asc;`;
        sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
		concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet,   CONVERT(avg(TIME_TO_SEC(service_time)/60)*queue_length,DECIMAL(10,2)) as avg_wait_time_queue1
		from GWR.Queue_matrix
		where created_at between (?) and (?) and outlet = ?
		and date_format(created_at, '%H:%i:%s') between '06:30' and '17:30'
		group by substr(created_at,1,13)
		order by substr(created_at,1,13)`; 
		
		}
		
		else if(outlet == 19){
			
			sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet,   CONVERT(avg(TIME_TO_SEC(service_time)/60)*queue_length,DECIMAL(10,2)) as avg_wait_time_queue1
			from GWR.Queue_matrix
			where created_at between (?) and (?) and outlet = ?
			and date_format(created_at, '%H:%i:%s') between '06:30' and '20:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13)`;
	
			}
		else{
		 sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet,   CONVERT(avg(TIME_TO_SEC(service_time)/60)*queue_length,DECIMAL(10,2)) as avg_wait_time_queue1
			from GWR.Queue_matrix
			where created_at between (?) and (?) and outlet = ?
			and date_format(created_at, '%H:%i:%s') between '08:30' and '22:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13)`; 

		}

		let data0 = connection.query(sqlQuery, [startDate+" 00:00:00", endDate+" 23:59:59", outlet]);

		dates2.map((item, index1) => {
			finaldata.push({
				name: item,
				data: [],
			});

			data0.map((item2, index2) => {
				if (item == item2.date) {
					finaldata[index1].data.push(item2.avg_wait_time_queue1);
				}
			});
		});
		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.timeVsAvgWaitTimeQueue1_u = (req, res) => {
	const { dateOne, dateTwo, outlet } = req.query;
	if (validator.isDate(dateOne) && validator.isDate(dateTwo)) {
		let dates2 = [dateOne, dateTwo];

		let finaldata = [];

		dates2.map((item) => {

			let sqlQuery = '';
			//let sqlQuery =
			//	'select date, concat(substr(time,1,2),":30") as time, location, avg(TIME_TO_SEC(avg_wait_time_queue1)/60) as avg_wait_time_queue1 from GWR.gwr_reg_stats where date = ? and location in (?) group by date, location, substr(time,1,2) order by date desc,time asc;';
    		if(outlet == 6 || outlet == 10 || outlet == 14){

			 sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet,   CONVERT(avg(TIME_TO_SEC(service_time)/60)*queue_length,DECIMAL(10,2)) as avg_wait_time_queue1
			from GWR.Queue_matrix
			where created_at like '%${item}%' and outlet = ${outlet}
			and date_format(created_at, '%H:%i:%s') between '06:30' and '17:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13)`;
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery)
					.map((data2) => data2.avg_wait_time_queue1.toFixed(2)),
			});

		}
		else if(outlet == 19){
			
			sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet,   CONVERT(avg(TIME_TO_SEC(service_time)/60)*queue_length,DECIMAL(10,2)) as avg_wait_time_queue1
			from GWR.Queue_matrix
			where created_at like '%${item}%' and outlet = ${outlet}
			and date_format(created_at, '%H:%i:%s') between '06:30' and '20:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13)`;
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery)
					.map((data2) => data2.avg_wait_time_queue1.toFixed(2)),
			});
	
			}
		
		
		else{
			sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet,   CONVERT(avg(TIME_TO_SEC(service_time)/60)*queue_length,DECIMAL(10,2)) as avg_wait_time_queue1
			from GWR.Queue_matrix
			where created_at like '%${item}%' and outlet = ${outlet}
			and date_format(created_at, '%H:%i:%s') between '08:30' and '22:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13)`;
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery)
					.map((data2) => data2.avg_wait_time_queue1.toFixed(2)),
			});
		}
		});
		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.timeVsQueueLength1_2 = (req, res) => {
	const { startDate, endDate, outlet } = req.query;
	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let finaldata = [];
		
let sqlQuery = '';
		if(outlet == 6 || outlet == 10 || outlet == 14){


		sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
		concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, ceil(avg(queue_length)) as queue_length_1
		from GWR.Queue_matrix
		where created_at between (?) and (?) and outlet = ?
		and date_format(created_at, '%H:%i:%s') between '06:30' and '17:30'
		group by substr(created_at,1,13)
		order by substr(created_at,1,13);`;

		}
		
		else if(outlet == 19){
			
			sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, ceil(avg(queue_length)) as queue_length_1
			from GWR.Queue_matrix
			where created_at between (?) and (?) and outlet = ?
			and date_format(created_at, '%H:%i:%s') between '06:30' and '20:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13);`;
	
			}
		
		else{
			sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
		concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, ceil(avg(queue_length)) as queue_length_1
		from GWR.Queue_matrix
		where created_at between (?) and (?) and outlet = ?
		and date_format(created_at, '%H:%i:%s') between '08:30' and '22:30'
		group by substr(created_at,1,13)
		order by substr(created_at,1,13);`;
		}

		let data0 = connection.query(sqlQuery, [startDate+" 00:00:00", endDate+" 23:59:59", outlet]);

		// dates2.map((item) => {

		// 	finaldata.push({
		// 		name: item,
		// 		data: connection
		// 			.query(sqlQuery, [item, location])
		// 			.map((data2) => data2.queue_length_1),
		// 	});
		// });

		dates2.map((item, index1) => {
			finaldata.push({
				name: item,
				data: [],
			});

			data0.map((item2, index2) => {
				if (item == item2.date) {
					finaldata[index1].data.push(item2.queue_length_1);
				}
			});
		});

		res.status(200).json({ message: "List", data: finaldata });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};

module.exports.timeVsQueueLength1_u = (req, res) => {
	const { dateOne, dateTwo, outlet } = req.query;
	if (validator.isDate(dateOne) && validator.isDate(dateTwo)) {
		let dates2 = [dateOne, dateTwo];
		let finaldata = [];
		dates2.map((item) => {

			let sqlQuery = '';
			//let sqlQuery =
			//	'select date, concat(substr(time,1,2),":30") as time, location, CEILING(avg(queue_length_1)) as queue_length_1 from GWR.gwr_reg_stats where date = ? and location in (?) group by date, location, substr(time,1,2) order by date desc,time asc;';
			if(outlet == 6 || outlet == 10 || outlet == 14){


			sqlQuery =  `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, ceil(avg(queue_length)) as queue_length_1
			from GWR.Queue_matrix
			where created_at like '%${item}%' and outlet = ${outlet}
			and date_format(created_at, '%H:%i:%s') between '06:30' and '17:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13);`;

			}
			
			else if(outlet == 19){
			
				sqlQuery =  `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, ceil(avg(queue_length)) as queue_length_1
			from GWR.Queue_matrix
			where created_at like '%${item}%' and outlet = ${outlet}
			and date_format(created_at, '%H:%i:%s') between '06:30' and '20:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13);`;
		
				}
			else{
				 sqlQuery =  `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, ceil(avg(queue_length)) as queue_length_1
			from GWR.Queue_matrix
			where created_at like '%${item}%' and outlet = ${outlet}
			and date_format(created_at, '%H:%i:%s') between '08:30' and '22:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13);`;
			}


			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery)
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
	let sqlQuery =
		"select id,name,email,access,last_login,location,designation from GWR.users where show_on_dashboard = 'yes'";
	let data = connection.query(sqlQuery);

	res.status(200).json({ message: "Userslist List", data: data });
};
module.exports.addUser = async (req, res) => {
	const { name, email, password, location,designation } = req.body;
	// let encryptedData = encryptData(req.body);
	// console.log(encryptedData);
	// let decryptedData = decryptData(encryptedData);
	// const { name, email, password, location } = decryptedData;
	// console.log(decryptedData);
	let locationStrings = JSON.stringify(location);
	let passwordRegex = new RegExp(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
	);
	if (passwordRegex.test(password)) {
		let sqlQuery =
			"select id,name,email,access,last_login,location from GWR.users where email=?";
		con.query(sqlQuery, [email], (err, result) => {
			if (err) {
				res.send("Error Caught");
			} else {
				if (result.length > 0) {
					res.send("Users Already Exists");
				} else {
					bcrypt.hash(password, 10, function (err, hash) {
						// Store hash in your password DB.
						if (err) {
							res.send("Error caught");
						} else {
							let saveSqlQuery =
								"Insert into GWR.users(name,email,password,location,designation,show_on_dashboard) values (?,?,?,?,?,?);";
							con.query(
								saveSqlQuery,
								[name, email, hash, locationStrings,designation,'yes'],
								(err, result) => {
									if (err) {
										res.send("Error caught");
									} else {
										res.send("User got added with us");
									}
								}
							);
						}
					});
				}
			}
		});
	} else {
		res.send("Password must be 8 character long or more and has one Uppercase,One LowerCase,One Digit and a special Character.");
	}
};



module.exports.deleteUser = async (req, res) => {
	const { id } = req.body;
	// let encryptedData = encryptData(req.body);
	// console.log(encryptedData);
	// let decryptedData = decryptData(encryptedData);
	// const { name, email, password, location } = decryptedData;
	// console.log(decryptedData);
	
		let sqlQuery =
			"delete from GWR.users where id=?";
		con.query(sqlQuery, [id], (err, result) => {
			if (err) {
				res.send("Error Caught");
			} else {
				res.send("User deleted successfully!");

			}
			
		}); 
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
		//  let sqlQuery =
		//  	"select id,date,time,image,location,desk_number,camera_id from GWR.gwr_alerts_desk where date between ? and ? and location = ? and desk_number <> 'Bucket Pool Counter' order by date desc, time asc;";
 
		let sqlQuery =  `select Attendant.id,date_format(Attendant.created_at, '%Y-%m-%d') as date,date_format(Attendant.created_at, '%H:%i:%s') as time,image,location from GWR.Attendant join GWR.outlets on Attendant.outlet = outlets.id where Attendant.created_at between (?) and (?) and location = ? order by id desc;`;

		 let data = connection.query(sqlQuery, [startDate, endDate, location]);

		 console.log(data);

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
		//let finaldata = [];

		// dates2.map((item) => {
			let sqlQuery = '';
		if(outlet == 6 || outlet == 10 || outlet == 14){

		sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
		concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, sum(count) as sumfootfall
		from GWR.footfall
		where created_at between (?) and (?) and outlet = ${outlet}
		and date_format(created_at, '%H:%i:%s') between '06:30' and '17:30'
		group by substr(created_at,1,13)
		order by substr(created_at,1,13);`;

		}

		else if(outlet == 19){
			
			sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
		concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, sum(count) as sumfootfall
		from GWR.footfall
		where created_at between (?) and (?) and outlet = ${outlet}
		and date_format(created_at, '%H:%i:%s') between '06:30' and '20:30'
		group by substr(created_at,1,13)
		order by substr(created_at,1,13);`;
	
			}
		
		else{
			sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, sum(count) as sumfootfall
			from GWR.footfall
			where created_at between (?) and (?) and outlet = ${outlet}
			and date_format(created_at, '%H:%i:%s') between '08:30' and '22:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13);`;

		}

		let data0 = connection.query(sqlQuery, [
			startDate+" 00:00:00", endDate+" 23:59:59",
			outlet
		]);

		let finaldata = [];

		dates2.map((item, index1) => {
			finaldata.push({
				name: item,
				data: [],
			});

			data0.map((item2, index2) => {
				if (item == item2.date) {
					finaldata[index1].data.push(item2.sumfootfall);
				}
			});
		});
		// finaldata.push({
		// 	name: item,
		// 	data: c
		// 		.map((data2) => data2.difference),
		// });

		//});

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

			let sqlQuery = '';
		//	let sqlQuery =
		//		'select date,concat(substr(time,1,2),":30") as time, location, sum(footfall) as difference from GWR.Footfall where date = ? and location in (?) and outlet = ? group by date, location, substr(time,1,2) order by date asc, time asc;';
		if(outlet == 6 || outlet == 10 || outlet == 14){


       sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
		concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, sum(count) as difference
		from GWR.footfall
		where created_at like '%${item}%' and outlet = ${outlet}
		and date_format(created_at, '%H:%i:%s') between '06:30' and '17:30'
		group by substr(created_at,1,13)
		order by substr(created_at,1,13);`;


		}

		else if(outlet == 19){
			
			sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, sum(count) as difference
			from GWR.footfall
			where created_at like '%${item}%' and outlet = ${outlet}
			and date_format(created_at, '%H:%i:%s') between '06:30' and '20:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13);`;
	
			}
		
		else{
			 sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
			concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, sum(count) as difference
			from GWR.footfall
			where created_at like '%${item}%' and outlet = ${outlet}
			and date_format(created_at, '%H:%i:%s') between '08:30' and '22:30'
			group by substr(created_at,1,13)
			order by substr(created_at,1,13);`;

		}
			finaldata.push({
				name: item,
				data: connection
					.query(sqlQuery, [outlet])
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
	let outlet = req.query.outlet;


	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		var d = new Date(startDate);
		d.setDate(d.getDate() - 7);
		var curr_date = d.getDate();
		var curr_month = d.getMonth();
		var curr_year = d.getFullYear();
		var current =
			curr_year + "-" + ("0" + (curr_month + 1)).slice(-2) + "-" + curr_date;

		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let data0 = [];

		dates2.map((item) => {
		//	let sqlQuery =
		//		"SELECT id,date,time,image,location,camera_id,desk_number,count(*) as count FROM GWR.gwr_alerts_desk where date = ? and location = ? and desk_number <> 'Bucket Pool Counter';";
		let sqlQuery = `SELECT id,date_format(created_at, '%Y-%m-%d') as date,image,count(*) as count FROM GWR.Attendant where date_format(created_at, '%Y-%m-%d') = ? and outlet = ?;`;
			let data = connection.query(sqlQuery, [item, outlet]);

			console.log(data);
			data0.push({
				date: item,
				count: data[0].count,
			});
		});

		res.status(200).json({ message: "Alerts count List", data: data0 });
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
		//let sqlQuery =
		//	"select date, location, sum(footfall) as footfall from GWR.Footfall where date between ? and ? and location in (?) and outlet = ? group by date, location order by date asc;";


		let sqlQuery = "select date_format(created_at, '%Y-%m-%d') as date,outlet, sum(count) as footfall from GWR.footfall where created_at between (?) and (?) and outlet = ? group by date order by date;"
		let data = connection.query(sqlQuery, [startDate+" 00:00:00", endDate+" 23:59:59", outlet]);

		console.log(data);

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
		//let sqlQueryOne =
		//	"select date, location, sum(footfall) as footfall from GWR.Footfall where date = ? and location in (?) and outlet = ? group by date, location order by date asc;";

        let sqlQueryOne = `select date_format(created_at, '%Y-%m-%d') as date,outlet, sum(count) as footfall from GWR.footfall where created_at like '%${dateOne}%' and outlet = ? group by date order by date;`;
		//let sqlQueryTwo =
		//	"select date, location, sum(footfall) as footfall from GWR.Footfall where date = ? and location in (?) and outlet = ? group by date, location order by date asc;";
        let sqlQueryTwo = `select date_format(created_at, '%Y-%m-%d') as date,outlet, sum(count) as footfall from GWR.footfall where created_at like '%${dateTwo}%' and outlet = ? group by date order by date;`;

		let data1 = connection.query(sqlQueryOne, [outlet]);

		let data2 = connection.query(sqlQueryTwo, [outlet]);

		let data3 = [...data1, ...data2];

		res.status(200).json({ message: "Alerts count List", data: data3 });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};


module.exports.entrydata =  (req, res) => {
	let outlet = req.query.outlet;
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let location = req.query.location;


		if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let finalresult = [];
		dates2.map((item) => {
			let sqlQuery =
				`SELECT sum(entry) as entry FROM GWR.Entry_exit where created_at like '%${item}%' and outlet = ?;`;
			finalresult.push( connection
					.query(sqlQuery, [outlet])[0].entry);
		});
		res.status(200).json({ message: "List", data: finalresult });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}

}


module.exports.exitdata =  (req, res) => {
	let outlet = req.query.outlet;
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let location = req.query.location;


		if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

		let finalresult = [];
		dates2.map((item) => {
			let sqlQuery =
				`SELECT sum(GWR.Entry_exit.exit) as exit1 FROM GWR.Entry_exit where created_at like '%${item}%' and outlet = ?;`;
			finalresult.push( connection
					.query(sqlQuery, [outlet])[0].exit1);
		});
		res.status(200).json({ message: "List", data: finalresult });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}

}


module.exports.getoutletnamebyid = (req, res) => {
	let outlet = req.query.outlet;
	let sqlQueryOne =
	"select name FROM GWR.outlets where id = ?;";

	let data1 = connection.query(sqlQueryOne, [outlet]);

    res.send(data1);

}


module.exports.getoutletimages = (req, res) => {
	let outlet = req.query.outlet;
	let sqlQueryOne =
	"select images FROM GWR.outlets where id = ?;";

	let data1 = connection.query(sqlQueryOne, [outlet]);

    res.send(data1);

}




module.exports.getentrydataforlinegraph = (req, res) => {
	let outlet = req.query.outlet;
	let date = req.query.date;
  

	let sqlQueryOne =
	`select date_format(created_at, '%Y-%m-%d') as date,
	concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, sum(GWR.Entry_exit.entry) as Entry, sum(GWR.Entry_exit.exit) as Exit1
	from GWR.Entry_exit
	where created_at between '${date} 08:30:00' and '${date} 22:30:00' and outlet = ?
	group by substr(created_at,1,13)
	order by substr(created_at,1,13);`;

	let data1 = connection.query(sqlQueryOne, [outlet]);

	let data = [];

	data1.map((item)=>{
		data.push(item.Entry)

	})

    res.send(data);

}


module.exports.getexitdataforlinegraph = (req, res) => {
	let outlet = req.query.outlet;
	let date = req.query.date;

	let sqlQueryOne =
	`select date_format(created_at, '%Y-%m-%d') as date,
	concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, sum(GWR.Entry_exit.entry) as Entry, sum(GWR.Entry_exit.exit) as Exit1
	from GWR.Entry_exit
	where created_at between '${date} 08:30:00' and '${date} 22:30:00' and outlet = ?
	group by substr(created_at,1,13)
	order by substr(created_at,1,13);`;

	let data1 = connection.query(sqlQueryOne, [outlet]);

	let data = [];

	data1.map((item)=>{
		data.push(item.Exit1)

	})

    res.send(data);

}