var connection = require("../Config/db");
const validator = require("validator");
function convertDate(today) {
	var dd = String(today.getDate()).padStart(2, "0");
	var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
	var yyyy = today.getFullYear();
	return yyyy + "-" + mm + "-" + dd;
}
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

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function getNextTime(currentDate, currentTime) {
    const time = new Date(`${currentDate}T${currentTime}`);
    time.setMinutes(time.getMinutes() + 15);
    return time.toTimeString().slice(0, 5);
}


module.exports.footfalllinegraph = (req, res) => {

    let startDate = req.query?.startDate;
    let endDate = req.query?.endDate;
    let location = req.query?.location;
    let outlet = 'registration_desk';

   if(!startDate){
    startDate = formatDate(new Date().setDate(new Date().getDate() - 3));  
   }

   if(!endDate){
    endDate = formatDate(new Date());  
   }

   if(!location){
    location = "'GWR Manteca', 'GWR Lagrange'";  

   }
 

    let sqlQuery = `select date,concat(substr(time,1,2),":30") as time, location, sum(footfall) as sumfootfall
from GWR.Footfall
where date between '${startDate}' and '${endDate}' and location in (${location}) and outlet = '${outlet}'
group by date, location, substr(time,1,2)
order by date asc, time asc;`;

console.log(sqlQuery);

 let data0 = connection.query(sqlQuery)
        
res.send(data0);

};


module.exports.footfalldatewise = (req, res) => {

    let startDate = req.query?.startDate;
    let endDate = req.query?.endDate;
    let location = req.query?.location;
    let outlet = 'registration_desk';

   if(!startDate){
    startDate = formatDate(new Date().setDate(new Date().getDate() - 3));  
   }

   if(!endDate){
    endDate = formatDate(new Date());  
   }

   if(!location){
    location = "'GWR Manteca', 'GWR Lagrange'";  

   }
 

   let sqlQuery =
   `select date, location, sum(footfall) as footfall from GWR.Footfall where date between '${startDate}' and '${endDate}' and location in (${location}) and outlet = '${outlet}' group by date, location order by date asc;`;

let data = connection.query(sqlQuery);
        
res.send(data);

};



module.exports.timeVsAvgWaitTimeQueue = (req, res) => {

    let startDate = req.query?.startDate;
    let endDate = req.query?.endDate;
    let location = req.query?.location;

   if(!startDate){
    startDate = formatDate(new Date().setDate(new Date().getDate() - 3));  
   }

   if(!endDate){
    endDate = formatDate(new Date());  
   }

   if(!location){
    location = "'GWR Manteca', 'GWR Lagrange'";  

   }
 

   let sqlQuery =
				`select date, concat(substr(time,1,2),":30") as time, location, CONVERT(avg(TIME_TO_SEC(avg_wait_time_queue1)/60),DECIMAL(10,2)) as avg_wait_time_queue1 from GWR.gwr_reg_stats where date between '${startDate}' and '${endDate}' and location in (${location}) group by date, location, substr(time,1,2);`;
console.log(sqlQuery);
let data = connection.query(sqlQuery);
        
res.send(data);

};



module.exports.timeVsQueueLength = (req, res) => {

    let startDate = req.query?.startDate;
    let endDate = req.query?.endDate;
    let location = req.query?.location;

   if(!startDate){
    startDate = formatDate(new Date().setDate(new Date().getDate() - 3));  
   }

   if(!endDate){
    endDate = formatDate(new Date());  
   }

   if(!location){
    location = "'GWR Manteca', 'GWR Lagrange'";  

   }
 

   let sqlQuery =
				`select date, concat(substr(time,1,2),":30") as time, location, CEILING(avg(queue_length_1)) as queue_length_1 from GWR.gwr_reg_stats where date between '${startDate}' and '${endDate}' and location in (${location}) group by date, location, substr(time,1,2) order by date desc,time asc;`;
console.log(sqlQuery);
let data = connection.query(sqlQuery);
        
res.send(data);

};


module.exports.timeVsAvgServiceTime = (req, res) => {

    let startDate = req.query?.startDate;
    let endDate = req.query?.endDate;
    let location = req.query?.location;

   if(!startDate){
    startDate = formatDate(new Date().setDate(new Date().getDate() - 3));  
   }

   if(!endDate){
    endDate = formatDate(new Date());  
   }

   if(!location){
    location = "'GWR Manteca', 'GWR Lagrange'";  

   }
 

   let sqlQuery =
				`select date, concat(substr(time,1,2),":30") as time, location, avg(TIME_TO_SEC(avg_service_time)/60) as avg_service_time from GWR.gwr_reg_stats where date between '${startDate}' and '${endDate}' and location in (${location}) group by date, location, substr(time,1,2) order by time asc;`;
console.log(sqlQuery);
let data = connection.query(sqlQuery);
        
res.send(data);

};




module.exports.get_table_data = (req, res) => {
	
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let location = req.query.location;
	let outlet = req.query.outlet.split(',')[0];
    let outlet_name = req.query.outlet.split(',')[1];

	let sqlQuery = `SELECT ee.*
	FROM GWR.extreme_events AS ee
	JOIN GWR.outlets AS o ON ee.outlet = o.id
	WHERE ee.created_at BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'
	  AND ee.outlet = '${outlet}'
	  AND (o.name <> 'Front Desk'
		   OR (o.name = 'Front Desk'
			   AND (ee.type_of_event <> 'service_time' OR time_to_sec(ee.value) >= 900)))
	ORDER BY ee.created_at DESC;`;

	console.log(sqlQuery);
			let data = connection
					.query(sqlQuery);
	
		res.status(200).json({ message: "List", data: data });
	
};


module.exports.footfalllinegraph2 = (req, res) => {

let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let location = req.query.location;
	//let outlet = req.query.outlet;
	let outlet = req.query.outlet;


    let outlet_name = connection.query(`SELECT name FROM GWR.outlets where id = ${outlet}`)[0].name;

	//let outlet_name = req.query.outlet.split(',')[1];


	let time1 = '';
	let time2 = '';

	let outletlist1 = ['Buckets FEC','Buckets Waterpark','Front Desk'];


	if(outletlist1.includes(outlet_name)){
		time1 = '08:30:00';
		time2 = '22:50:00';

	}else if(outlet_name == 'StarBucks'){
		time1 = '07:00:00';
		time2 = '20:30:00';
	}else if(outlet_name == 'Dunkin Donut' || outlet_name == 'FreshWoods'){
		time1 = '06:30:00';
		time2 = '17:15:00';
	}



	if (validator.isDate(startDate) && validator.isDate(endDate)) {
		let dates = getDates(new Date(startDate), new Date(endDate));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});
		//let finaldata = [];

		// dates2.map((item) => {
			let sqlQuery = '';
	

		sqlQuery = `select date_format(created_at, '%Y-%m-%d') as date,
		concat(substr(date_format(created_at, '%H:%i:%s'),1,2),":30") as time ,outlet, sum(count) as sumfootfall
		from GWR.footfall
		where created_at between (?) and (?) and outlet = ${outlet}
		and date_format(created_at, '%H:%i:%s') between '${time1}' and '${time2}'
		group by substr(created_at,1,13)
		order by substr(created_at,1,13);`;

		

		let data0 = connection.query(sqlQuery, [
			startDate+" 00:00:00", endDate+" 23:59:59",
			outlet
		]);

        res.send(data0);


    }
};


module.exports.get_all_data =(req,res) =>  {

    let startDate = req.query.startDate;
	let endDate = req.query.endDate;
    let outlet = req.query.outlet;


    //let outlet_name = req.query.outlet.split(',')[1];

    let outlet_name = connection.query(`SELECT name FROM GWR.outlets where id = ${outlet}`)[0].name;


	let time1 = '';
	let time2 = '';

	let outletlist1 = ['Buckets FEC','Buckets Waterpark','Front Desk'];


	if(outletlist1.includes(outlet_name)){
		time1 = '08:30:00';
		time2 = '22:50:00';

	}else if(outlet_name == 'StarBucks'){
		time1 = '07:00:00';
		time2 = '20:30:00';
	}else if(outlet_name == 'Dunkin Donut' || outlet_name == 'FreshWoods'){
		time1 = '06:30:00';
		time2 = '17:45:00';
	}


	let sql =
	`SELECT
    DATE_FORMAT(created_at, '%Y-%m-%d') as date,
    CONCAT(SUBSTR(DATE_FORMAT(created_at, '%H:%i:%s'), 1, 2), ":30") as time,
    outlet,
    CONVERT(AVG(TIME_TO_SEC(service_time)/60), DECIMAL(10,2)) as avg_service_time,
    ROUND(AVG(queue_length)) AS queue_length,
    CONVERT(
        AVG(TIME_TO_SEC(service_time)/60) * ROUND(AVG(queue_length)) / (
            CASE
                WHEN ROUND(AVG(manned_terminals)) IS NULL OR ROUND(AVG(manned_terminals)) = 0
                THEN 1
                ELSE ROUND(AVG(manned_terminals))
            END
        ),
        DECIMAL(10,2)
    ) AS wait_time
FROM
    GWR.Queue_matrix
WHERE
    created_at BETWEEN '${startDate} 06:30:00' AND '${endDate} 23:00:00'
    AND outlet = ${outlet}
    AND DATE_FORMAT(created_at, '%H:%i:%s') BETWEEN '${time1}' AND '${time2}'
GROUP BY
    SUBSTR(created_at, 1, 13)
ORDER BY
    SUBSTR(created_at, 1, 13);`;


	let data = connection.query(sql);




	// res.status(200).json(data);
	
	// return;
	
	// const serviceTimeData = {};
	// const waitTimeData = {};
	// const queueLengthData = {};
	// // Process the data
	// data.forEach(entry => {

	//   const date = entry.date;
	//   const time = entry.time;
	
	//   // Initialize arrays if not present
	//   if (!serviceTimeData[date]) serviceTimeData[date] = [];
	//   if (!waitTimeData[date]) waitTimeData[date] = [];
	//   if (!queueLengthData[date]) queueLengthData[date] = [];
	//   // Push values to respective arrays
	
	// 	serviceTimeData[date].push(entry.avg_service_time);
	// 	waitTimeData[date].push(entry.wait_time);
	// 	queueLengthData[date].push(entry.queue_length);
	
	// });


    res.send(data);
	
}


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

		 let data = connection.query(sqlQuery, [startDate+" 00:00:00", endDate+" 23:59:59", location]);

		 console.log(data);

		res.status(200).json({ message: "Attendent absent  List", data: data });
	} else {
		res.status(400).json({ message: "Incorrect Data" });
	}
};


module.exports.heatmap_api = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let outlet = req.query.outlet;
	//let outlet_name = req.query.outlet.split(',')[1];

    let outlet_name = connection.query(`SELECT name FROM GWR.outlets where id = ${outlet}`)[0].name;


	let time1 = '';
	let time2 = '';

	let outletlist1 = ['Buckets FEC','Buckets Waterpark','Front Desk'];


	if(outletlist1.includes(outlet_name)){
		time1 = '08:30:00';
		time2 = '22:50:00';

	}else if(outlet_name == 'StarBucks'){
		time1 = '07:00:00';
		time2 = '20:30:00';
	}else if(outlet_name == 'Dunkin Donut' || outlet_name == 'FreshWoods'){
		time1 = '06:30:00';
		time2 = '17:15:00';
	}

	// let sql = `SELECT DATE_ADD("1000-01-01 00:00:00", Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
	// convert(avg(TIME_TO_SEC(service_time)/60),DECIMAL(10,2)) AS service_time,
	// round(avg(queue_length)) AS queue_length,
	// convert(avg(TIME_TO_SEC(service_time)/60)*round(avg(queue_length))/,Decimal(10,2)) AS wait_time
	// FROM GWR.Queue_matrix where created_at between '${startDate} 08:30:00' and '${endDate} 23:00:00' and outlet = ${outlet} and date_format(created_at, '%H:%i:%s')
	// GROUP BY login_datetime_15_min_interval
	// ORDER BY login_datetime_15_min_interval;`;

	let sql = `SELECT
    DATE_ADD(
        "1000-01-01 00:00:00",
        INTERVAL CEILING(
            TIMESTAMPDIFF(
                MINUTE,
                "1000-01-01 00:00:00",
                CONCAT(
                    DATE_FORMAT(created_at, '%Y-%m-%d'),
                    ' ',
                    DATE_FORMAT(created_at, '%H:%i:%s')
                )
            ) / 15
        ) * 15 MINUTE
    ) AS login_datetime_15_min_interval,
    CONVERT(
        AVG(TIME_TO_SEC(service_time)/60),
        DECIMAL(10,2)
    ) AS service_time,
    ROUND(AVG(queue_length)) AS queue_length,
    CONVERT(
        AVG(TIME_TO_SEC(service_time)/60) * ROUND(AVG(queue_length)) / (
            CASE
                WHEN ROUND(manned_terminals) IS NULL OR ROUND(manned_terminals) = 0
                THEN 1
                ELSE ROUND(manned_terminals)
            END
        ),
        DECIMAL(10,2)
    ) AS wait_time
FROM
    GWR.Queue_matrix
WHERE
    created_at BETWEEN '${startDate} ${time1}' AND '${endDate} ${time2}'
    AND outlet = '${outlet}'
	AND TIME(created_at) BETWEEN '${time1}' AND '${time2}'
    AND DATE_FORMAT(created_at, '%H:%i:%s')
GROUP BY
    login_datetime_15_min_interval
ORDER BY
    login_datetime_15_min_interval;`

	
let data = connection.query(sql);


res.send(data);

// res.status(200).json(data);

// return;

// const serviceTimeData = {};
// const waitTimeData = {};
// const queueLengthData = {};
// // Process the data
// data.forEach(entry => {
//   const datetime = entry.login_datetime_15_min_interval;
//   const date = datetime.split(" ")[0];
//   const time = datetime.split(" ")[1];

//   // Initialize arrays if not present
//   if (!serviceTimeData[date]) serviceTimeData[date] = [];
//   if (!waitTimeData[date]) waitTimeData[date] = [];
//   if (!queueLengthData[date]) queueLengthData[date] = [];
//   // Push values to respective arrays

//     serviceTimeData[date].push(entry.service_time);
// 	waitTimeData[date].push(entry.wait_time);
// 	queueLengthData[date].push(entry.queue_length);

// });


// // Convert objects to arrays
// const serviceTimeArray = Object.entries(serviceTimeData).map(([date, data]) => ({ name: date, data: data }));
// const waitTimeArray = Object.entries(waitTimeData).map(([date, data]) => ({ name: date, data: data }));
// const queueLengthArray = Object.entries(queueLengthData).map(([date, data]) => ({ name: date, data: data }));
// // console.log("Service Time Data:", serviceTimeArray);
// // console.log("Wait Time Data:", waitTimeArray);
// // console.log("Queue Length Data:", queueLengthArray);

// res.status(200).json({ message: "List", data: {
// 	serviceTimeArray:serviceTimeArray,
// 	waitTimeArray:waitTimeArray,
// 	queueLengthArray:queueLengthArray} });




};


module.exports.heatmap_api_footfall = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let outlet = req.query.outlet;
	//let outlet_name = req.query.outlet.split(',')[1];

    let outlet_name = connection.query(`SELECT name FROM GWR.outlets where id = ${outlet}`)[0].name;


	let time1 = '';
	let time2 = '';

	let outletlist1 = ['Buckets FEC','Buckets Waterpark','Front Desk'];


	if(outletlist1.includes(outlet_name)){
		time1 = '08:30:00';
		time2 = '22:50:00';

	}else if(outlet_name == 'StarBucks'){
		time1 = '07:00:00';
		time2 = '20:30:00';
	}else if(outlet_name == 'Dunkin Donut' || outlet_name == 'FreshWoods'){
		time1 = '06:30:00';
		time2 = '17:15:00';
	}

	let sql = `SELECT
    DATE_ADD(
        '1000-01-01 00:00:00',
        INTERVAL CEILING(
            TIMESTAMPDIFF(
                MINUTE,
                '1000-01-01 00:00:00',
                CONCAT(
                    DATE_FORMAT(created_at, '%Y-%m-%d'),
                    ' ',
                    DATE_FORMAT(created_at, '%H:%i:%s')
                )
            ) / 15
        ) * 15 MINUTE
    ) AS login_datetime_15_min_interval,
    CEILING(COUNT) AS footfall
FROM
    GWR.footfall
WHERE
    created_at between '${startDate} ${time1}' and '${endDate} ${time2}'
    AND outlet = ${outlet}
	AND TIME(created_at) BETWEEN '${time1}' AND '${time2}'

GROUP BY
    login_datetime_15_min_interval
ORDER BY
    login_datetime_15_min_interval;`;


	let data = connection.query(sql);
	res.send(data);

	// const footfallData = {};

	// // Process the data
	// data.forEach(entry => {
	//   const datetime = entry.login_datetime_15_min_interval;
	//   const date = datetime.split(" ")[0];
	//   const time = datetime.split(" ")[1];
	
	//   // Initialize arrays if not present
	//   if (!footfallData[date]) footfallData[date] = [];

	//   // Push values to respective arrays
	
	

	//   footfallData[date].push(entry.footfall);
		
	
	
	// });
	
	
	// // Convert objects to arrays
	// const footfallDataArray = Object.entries(footfallData).map(([date, data]) => ({ name: date, data: data }));

	
	// res.status(200).json({ message: "List", data: footfallDataArray });
	
	


	}