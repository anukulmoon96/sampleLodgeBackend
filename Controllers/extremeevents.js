const moment = require("moment/moment");
var connection = require("../Config/db");
const validator = require("validator");


module.exports.get_table_data = (req, res) => {
	
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let location = req.query.location;
	let outlet = req.query.outlet.split(',')[0];
    let outlet_name = req.query.outlet.split(',')[1];
	let pageNumber = req.query.pageNumber;
	let limit = req.query.limit;
	let total = 0;

	let sqlQuery = `SELECT ee.*,u.name
	FROM GWR.extreme_events AS ee
	JOIN GWR.outlets AS o ON ee.outlet = o.id
	LEFT JOIN GWR.users AS u ON ee.CommentedBy = u.id
	WHERE ee.created_at BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'
	  AND ee.outlet = '${outlet}'
	  AND (o.name <> 'Front Desk'
		   OR (o.name = 'Front Desk'
			   AND (ee.type_of_event <> 'service_time' OR time_to_sec(ee.value) >= 900)
			   AND (ee.type_of_event <> 'queue_length' OR ee.value >= 18)))
	ORDER BY ee.created_at DESC limit ${pageNumber*limit} , ${limit};`;

	console.log(sqlQuery);
			let data = connection
					.query(sqlQuery);


					let totalcount = connection
					.query(`SELECT count(*) as count
					FROM GWR.extreme_events AS ee
					JOIN GWR.outlets AS o ON ee.outlet = o.id
					WHERE ee.created_at BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'
					  AND ee.outlet = '${outlet}'
					  AND (o.name <> 'Front Desk'
						   OR (o.name = 'Front Desk'
							   AND (ee.type_of_event <> 'service_time' OR time_to_sec(ee.value) >= 900)
							   AND (ee.type_of_event <> 'queue_length' OR ee.value >= 18)))
					ORDER BY ee.created_at DESC`)[0].count;

					console.log(data);
	
		res.status(200).json({ message: "List", data: data,total:totalcount });
	
};


module.exports.get_table_data2 = (req, res) => {
	
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let location = req.query.location;
	let outlet = req.query.outlet.split(',')[0];
    let outlet_name = req.query.outlet.split(',')[1];
	let pageNumber = req.query.pageNumber;
	let limit = req.query.limit;
	let total = 0;

	let sqlQuery = `SELECT ee.*,u.name
	FROM GWR.extreme_events AS ee
	JOIN GWR.outlets AS o ON ee.outlet = o.id
	LEFT JOIN GWR.users AS u ON ee.CommentedBy = u.id
	WHERE ee.created_at BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'
	  AND ee.outlet = '${outlet}'
	  AND (o.name <> 'Front Desk'
		   OR (o.name = 'Front Desk'
			   AND (ee.type_of_event <> 'service_time' OR time_to_sec(ee.value) >= 900)
			   AND (ee.type_of_event <> 'queue_length' OR ee.value >= 18)))
	ORDER BY ee.created_at`;


			let data = connection
					.query(sqlQuery);


					
					console.log(data);

		res.status(200).json({ message: "List", data: data });
	
};
