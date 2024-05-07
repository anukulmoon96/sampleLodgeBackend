const moment = require("moment/moment");
var connection = require("../Config/db");
const validator = require("validator");


module.exports.get_table_data = (req, res) => {
	
	let startDate = req.query.startDate;
	let endDate = req.query.endDate;
	let location = req.query.location;
	let outlet = req.query.outlet.split(',')[0];
    let outlet_name = req.query.outlet.split(',')[1];

	let sqlQuery = `SELECT ee.*
	FROM GWR.Attendant AS ee
	JOIN GWR.outlets AS o ON ee.outlet = o.id
	WHERE ee.created_at BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'
	  AND ee.outlet = '${outlet}'
	ORDER BY ee.created_at DESC;`;

	console.log(sqlQuery);
			let data = connection
					.query(sqlQuery);
	
		res.status(200).json({ message: "List", data: data });
	
};
