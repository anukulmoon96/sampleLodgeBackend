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

function getNextDate(currentDate) {
	const date = new Date(currentDate);
	date.setDate(date.getDate() + 1);
	return date.toISOString().slice(0, 10);
  }



  function getNextTime(currentDate, currentTime) {
    const time = new Date(`${currentDate}T${currentTime}`);
    time.setMinutes(time.getMinutes() + 15);
    return time.toTimeString().slice(0, 8);
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
			
				sqlQuery = `SELECT DATE_ADD("1000-01-01 00:00:00",
				 Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00", 
				 concat(date_format(created_at, '%Y-%m-%d')," ",date_format(created_at, '%H:%i:%s'))) /15) * 15 minute) AS 
				 login_datetime_15_min_interval, avg(TIME_TO_SEC(service_time)/60) AS 
				 service_time FROM GWR.Queue_matrix where created_at like '%${item}%' 
				  and outlet = '${outlet}' and concat(date_format(created_at, '%H:%i:%s'))
				   between '06:30:00' and '20:40:00' GROUP BY login_datetime_15_min_interval
				    ORDER BY login_datetime_15_min_interval`;

		
				}
			
			else{

		 sqlQuery = `SELECT DATE_ADD("1000-01-01 00:00:00",
		  Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00",
		   concat(date_format(created_at, '%Y-%m-%d')," ",date_format(created_at, '%H:%i:%s'))) /15) * 15 minute) AS login_datetime_15_min_interval,
		    avg(TIME_TO_SEC(service_time)/60) AS service_time FROM GWR.Queue_matrix 
			where created_at like '%${item}%'  and outlet = '${outlet}'
			 and concat(date_format(created_at, '%H:%i:%s')) between
			  '08:30:00' and '22:40:00' GROUP BY login_datetime_15_min_interval
			   ORDER BY login_datetime_15_min_interval`;

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



module.exports.gwr_reg_stats2 = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let outlet = req.query.outlet;


	
	if (validator.isDate(startDate) && validator.isDate(endDate)) {


		let sql = '';

		if(outlet == 6 || outlet == 10 || outlet == 14){
		sql = `SELECT DATE_ADD("1000-01-01 00:00:00", 
					   Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00",
						concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
		convert(avg(TIME_TO_SEC(service_time)/60),DECIMAL(10,2)) AS service_time
		FROM GWR.Queue_matrix where created_at between '${startDate} 06:30:00' and '${endDate} 17:50:00' 
		and outlet = ${outlet} and date_format(created_at, '%H:%i:%s')
		GROUP BY login_datetime_15_min_interval
		ORDER BY login_datetime_15_min_interval;`;
		
		
		}
		else if(outlet == 19){
			 sql = `SELECT DATE_ADD("1000-01-01 00:00:00", 
			Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00",
			 concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
		convert(avg(TIME_TO_SEC(service_time)/60),DECIMAL(10,2)) AS service_time
		FROM GWR.Queue_matrix where created_at between '${startDate} 06:30:00' and '${endDate} 20:40:00' 
		and outlet = ${outlet} and date_format(created_at, '%H:%i:%s')
		GROUP BY login_datetime_15_min_interval
		ORDER BY login_datetime_15_min_interval;`;
		
		}
					
		else{
		
			 sql = `SELECT DATE_ADD("1000-01-01 00:00:00", 
			Interval CEILING(TIMESTAMPDIFF(MINUTE, "1000-01-01 00:00:00",
			 concat(date_format(created_at, '%Y-%m-%d'),' ',date_format(created_at, '%H:%i:%s'))) / 15) * 15 minute) AS login_datetime_15_min_interval,
		convert(avg(TIME_TO_SEC(service_time)/60),DECIMAL(10,2)) AS service_time
		FROM GWR.Queue_matrix where created_at between '${startDate} 08:30:00' and '${endDate} 22:50:00' 
		and outlet = ${outlet} and date_format(created_at, '%H:%i:%s')
		GROUP BY login_datetime_15_min_interval
		ORDER BY login_datetime_15_min_interval;`;
		}

let data = connection
.query(sql);
			const serviceTimeData = {};

			data.forEach(entry => {
				const datetime = entry.login_datetime_15_min_interval;
				const date = datetime.split(" ")[0];
				const time = datetime.split(" ")[1];
			  
				// Initialize arrays if not present
				if (!serviceTimeData[date]) serviceTimeData[date] = [];
				
				// Push values to respective arrays
			  
			  
				if(outlet == 6 || outlet == 10 || outlet == 14){
					if(time >= '06:30:00' && time <= '17:50:00'){
						serviceTimeData[date].push(entry.service_time);
				  }
			}else if(outlet == 19){
				if(time >= '06:30:00' && time <= '20:40:00'){
					serviceTimeData[date].push(entry.service_time);
			  }
			}else{
				if(time >= '08:30:00' && time <= '22:50:00'){
					serviceTimeData[date].push(entry.service_time);
			  }

			}
			  
			  });
			  
			  
			  // Convert objects to arrays
			  const serviceTimeArray = Object.entries(serviceTimeData).map(([date, data]) => ({ name: date, data: data }));
			  res.status(200).json({ message: "List", data: serviceTimeArray });

		
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
	let outlet = req.query.outlet.split(',')[0];
	let outlet_name = req.query.outlet.split(',')[1];
	let location = req.query.location;


	let time1 = '';
	let time2 = '';

	let outletlist1 = ['Buckets FEC','Buckets Waterpark','Front Desk'];

	let lodge_names = ['GWR Mason', 'GWR Dells','GWR Williamsburg','GWR Sandusky'];
	
	if(outletlist1.includes(outlet_name)){
		if (lodge_names.includes(location) && outlet_name=='Front Desk'){
			time1 = '09:15:00';
			time2 = '17:30:00';
		}
		else{
			time1 = '08:30:00';
			time2 = '22:50:00';
		}


	// if(outletlist1.includes(outlet_name)){
	// 	time1 = '08:30:00';
	// 	time2 = '22:30:00';

	}else if(outlet_name == 'StarBucks'){
		time1 = '06:30:00';
		time2 = '22:30:00';
	}else if(outlet_name == 'Dunkin Donut' || outlet_name == 'FreshWoods'){
		time1 = '06:30:00';
		time2 = '17:15:00';
	}else if(outlet_name == 'Ropes Course'){
		time1 = '11:30:00';
		time2 = '22:30:00';
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
    ) AS wait_time,
	ROUND(AVG(manned_terminals)) AS manned_terminals
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


// console.log(data);



if(outletlist1.includes(outlet_name)){
	

	for (let currentDate = startDate; currentDate <= endDate; currentDate = getNextDate(currentDate)) {

		let time11 = '';
		let time21 = '';
		if (lodge_names.includes(location) && outlet_name=='Front Desk'){
			time11 = '09:30:00';
			time21 = '17:30:00';
		}
		else{
			time11 = '08:30:00';
			time21 = '22:30:00';
		}
		
	for (let currentTime = time11; currentTime <= time21; currentTime = getNextTime(currentDate, currentTime)) {

	//	for (let currentTime = '08:30:00'; currentTime <= '22:30:00'; currentTime = getNextTime(currentDate, currentTime)) {

			//console.log(currentDate,currentTime);

		  const missingData = data.find(
			(entry) =>
			  entry.login_datetime_15_min_interval == currentDate+" "+currentTime
		  );
	  
		  // If missingData is undefined, it means the data is missing, so add it with null values
		  if (!missingData) {
			data.push({
			  login_datetime_15_min_interval: currentDate+" "+currentTime,
			  service_time: null,
			  queue_length: null,
			  wait_time: null,
			  manned_terminals: null
			});
		  }
		}
	  }

}else if(outlet_name == 'StarBucks'){
	for (let currentDate = startDate; currentDate <= endDate; currentDate = getNextDate(currentDate)) {
		for (let currentTime = '06:30:00'; currentTime <= '20:30:00'; currentTime = getNextTime(currentDate, currentTime)) {
		  const missingData = data.find(
			(entry) =>
			  entry.login_datetime_15_min_interval == currentDate+" "+currentTime
		  );
	  
		  // If missingData is undefined, it means the data is missing, so add it with null values
		  if (!missingData) {
			data.push({
			  login_datetime_15_min_interval: currentDate+" "+currentTime,
			  service_time: null,
			  queue_length: null,
			  wait_time: null,
			  manned_terminals: null
			});
		  }
		}
	  }
}else if(outlet_name == 'Dunkin Donut' || outlet_name == 'FreshWoods'){

	for (let currentDate = startDate; currentDate <= endDate; currentDate = getNextDate(currentDate)) {
		for (let currentTime = '06:30:00'; currentTime <= '17:30:00'; currentTime = getNextTime(currentDate, currentTime)) {
		  const missingData = data.find(
			(entry) =>
			  entry.login_datetime_15_min_interval == currentDate+" "+currentTime
		  );
	  
		  // If missingData is undefined, it means the data is missing, so add it with null values
		  if (!missingData) {
			data.push({
			  login_datetime_15_min_interval: currentDate+" "+currentTime,
			  service_time: null,
			  queue_length: null,
			  wait_time: null,
			  manned_terminals: null
			});
		  }
		}
	  }

}else if(outlet_name == 'Ropes Course'){

	for (let currentDate = startDate; currentDate <= endDate; currentDate = getNextDate(currentDate)) {
		for (let currentTime = '11:30:00'; currentTime <= '22:30:00'; currentTime = getNextTime(currentDate, currentTime)) {
		  const missingData = data.find(
			(entry) =>
			  entry.login_datetime_15_min_interval == currentDate+" "+currentTime
		  );
	  
		  // If missingData is undefined, it means the data is missing, so add it with null values
		  if (!missingData) {
			data.push({
			  login_datetime_15_min_interval: currentDate+" "+currentTime,
			  service_time: null,
			  queue_length: null,
			  wait_time: null,
			  manned_terminals:null
			});
		  }
		}
	  }

}



let data0 = data.sort((a, b) => {
	const dateA = new Date(a.login_datetime_15_min_interval);
	const dateB = new Date(b.login_datetime_15_min_interval);
	return dateA - dateB;
  });



const serviceTimeData = {};
const waitTimeData = {};
const queueLengthData = {};
const mannedTerminalData = {};

// Process the data
data0.forEach(entry => {
  const datetime = entry.login_datetime_15_min_interval;
  const date = datetime.split(" ")[0];
  const time = datetime.split(" ")[1];

  // Initialize arrays if not present
  if (!serviceTimeData[date]) serviceTimeData[date] = [];
  if (!waitTimeData[date]) waitTimeData[date] = [];
  if (!queueLengthData[date]) queueLengthData[date] = [];
  if (!mannedTerminalData[date]) mannedTerminalData[date] = [];

  // Push values to respective arrays

    serviceTimeData[date].push(entry.service_time);
	waitTimeData[date].push(entry.wait_time);
	queueLengthData[date].push(entry.queue_length);
	mannedTerminalData[date].push(entry.manned_terminals);
});


// Convert objects to arrays
const serviceTimeArray = Object.entries(serviceTimeData).map(([date, data]) => ({ name: date, data: data }));
const waitTimeArray = Object.entries(waitTimeData).map(([date, data]) => ({ name: date, data: data }));
const queueLengthArray = Object.entries(queueLengthData).map(([date, data]) => ({ name: date, data: data }));
const mannedTerminalArray = Object.entries(mannedTerminalData).map(([date, data]) => ({ name: date, data: data }));

// console.log("Service Time Data:", serviceTimeArray);
// console.log("Wait Time Data:", waitTimeArray);
// console.log("Queue Length Data:", queueLengthArray);

res.status(200).json({ message: "List", data: {
	serviceTimeArray:serviceTimeArray,
	waitTimeArray:waitTimeArray,
	queueLengthArray:queueLengthArray,
	mannedTerminalArray:mannedTerminalArray} });


};


module.exports.heatmap_api_footfall = (req, res) => {
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let outlet = req.query.outlet.split(',')[0];
	let outlet_name = req.query.outlet.split(',')[1];
	let location = req.query.location;



	let time1 = '';
	let time2 = '';

	let outletlist1 = ['Buckets FEC','Buckets Waterpark','Front Desk'];

	let lodge_names = ['GWR Mason', 'GWR Dells','GWR Williamsburg','GWR Sandusky'];
	
	if(outletlist1.includes(outlet_name)){
		if (lodge_names.includes(location) && outlet_name=='Front Desk'){
			time1 = '09:00:00';
			time2 = '18:00:00';
		}
		else{
			time1 = '08:30:00';
			time2 = '22:50:00';
		}

	// if(outletlist1.includes(outlet_name)){
	// 	time1 = '08:30:00';
	// 	time2 = '22:50:00';

	}else if(outlet_name == 'StarBucks'){
		time1 = '06:30:00';
		time2 = '20:30:00';
	}else if(outlet_name == 'Dunkin Donut' || outlet_name == 'FreshWoods'){
		time1 = '06:30:00';
		time2 = '17:15:00';
	}else if(outlet_name == 'Ropes Course'){
		time1 = '11:30:00';
		time2 = '22:30:00';
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



	if(outletlist1.includes(outlet_name)){

		
	

		for (let currentDate = startDate; currentDate <= endDate; currentDate = getNextDate(currentDate)) {

			let time11 = '';
			let time21 = '';
			if (lodge_names.includes(location) && outlet_name=='Front Desk'){
				time11 = '09:30:00';
				time21 = '17:30:00';
			}
			else{
				time11 = '08:30:00';
				time21 = '22:30:00';
			}
			
		for (let currentTime = time11; currentTime <= time21; currentTime = getNextTime(currentDate, currentTime)) {


			//for (let currentTime = '08:30:00'; currentTime <= '22:30:00'; currentTime = getNextTime(currentDate, currentTime)) {
	
				//console.log(currentDate,currentTime);
	
			  const missingData = data.find(
				(entry) =>
				  entry.login_datetime_15_min_interval == currentDate+" "+currentTime
			  );
		  
			  // If missingData is undefined, it means the data is missing, so add it with null values
			  if (!missingData) {
				data.push({
				  login_datetime_15_min_interval: currentDate+" "+currentTime,
				  footfall: null
				});
			  }
			}
		  }
	
	}else if(outlet_name == 'StarBucks'){

		
		for (let currentDate = startDate; currentDate <= endDate; currentDate = getNextDate(currentDate)) {
			for (let currentTime = '06:30:00'; currentTime <= '20:30:00'; currentTime = getNextTime(currentDate, currentTime)) {
			  const missingData = data.find(
				(entry) =>
				  entry.login_datetime_15_min_interval == currentDate+" "+currentTime
			  );
		  
			  // If missingData is undefined, it means the data is missing, so add it with null values
			  if (!missingData) {
				data.push({
				  login_datetime_15_min_interval: currentDate+" "+currentTime,
				  footfall: null
				});
			  }
			}
		  }
	}else if(outlet_name == 'Dunkin Donut' || outlet_name == 'FreshWoods'){
		
	
		for (let currentDate = startDate; currentDate <= endDate; currentDate = getNextDate(currentDate)) {
			for (let currentTime = '06:30:00'; currentTime <= '17:30:00'; currentTime = getNextTime(currentDate, currentTime)) {
			  const missingData = data.find(
				(entry) =>
				  entry.login_datetime_15_min_interval == currentDate+" "+currentTime
			  );
		  
			  // If missingData is undefined, it means the data is missing, so add it with null values
			  if (!missingData) {
				data.push({
				  login_datetime_15_min_interval: currentDate+" "+currentTime,
				  footfall: null
				});
			  }
			}
		  }
	
	}else if(outlet_name == 'Ropes Course'){
		
	
		for (let currentDate = startDate; currentDate <= endDate; currentDate = getNextDate(currentDate)) {
			for (let currentTime = '11:30:00'; currentTime <= '22:30:00'; currentTime = getNextTime(currentDate, currentTime)) {
			  const missingData = data.find(
				(entry) =>
				  entry.login_datetime_15_min_interval == currentDate+" "+currentTime
			  );
		  
			  // If missingData is undefined, it means the data is missing, so add it with null values
			  if (!missingData) {
				data.push({
				  login_datetime_15_min_interval: currentDate+" "+currentTime,
				  footfall: null
				});
			  }
			}
		  }
	
	}
	
	
	
	let data0 = data.sort((a, b) => {
		const dateA = new Date(a.login_datetime_15_min_interval);
		const dateB = new Date(b.login_datetime_15_min_interval);
		return dateA - dateB;
	  });
	

	const footfallData = {};

	// Process the data
	data0.forEach(entry => {
	  const datetime = entry.login_datetime_15_min_interval;
	  const date = datetime.split(" ")[0];
	  const time = datetime.split(" ")[1];
	
	  // Initialize arrays if not present
	  if (!footfallData[date]) footfallData[date] = [];

	  // Push values to respective arrays
	
	

	  footfallData[date].push(entry.footfall);
		
	
	
	});
	
	
	// Convert objects to arrays
	const footfallDataArray = Object.entries(footfallData).map(([date, data]) => ({ name: date, data: data }));

	
	res.status(200).json({ message: "List", data: footfallDataArray });
	
	


	}