const moment = require("moment/moment");
var connection = require("../Config/db");
const validator = require("validator");


module.exports.get_lodges = (req, res) => {
	
	let outlet = req.query.outlet;

	let sqlQuery = `SELECT id,location FROM GWR.outlets where name = ?;`;
		
			let data = connection
					.query(sqlQuery,[outlet]);
	
		res.status(200).json({ message: "List", data: data });
	
};


module.exports.getaverageservicetimebyid =  (req, res) => {
	
	let date = req.query.date;


	let sqlQuery = `select outlet,CONVERT(avg(nullif((TIME_TO_SEC(service_time)/60),0)),DECIMAL(10,2)) as max_service_time
	from GWR.Queue_matrix
	where created_at between '${date} 08:30:00' and '${date} 22:30:00' and outlet  in (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22)
	group by outlet;`;


		
	

			let data = connection
					.query(sqlQuery);
	
		res.status(200).json({ message: "List", data: data });
	
};


module.exports.getmaxservicetimebyid =  (req, res) => {
	let date = req.query.date;

	let sqlQuery = `select outlet,CONVERT(max(TIME_TO_SEC(service_time)/60),DECIMAL(10,2)) as max_service_time
	from GWR.Queue_matrix
	where created_at between '${date} 08:30:00' and '${date} 22:30:00' and outlet  in (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22)
	group by outlet;`;
	

	
			let data = connection
					.query(sqlQuery);
	
		res.status(200).json({ message: "List", data: data });
	
};



module.exports.getaverageexpectedwaittimebyid =  (req, res) => {
	let date = req.query.date;

	let sqlQuery = `select outlet,CONVERT(avg(nullif((TIME_TO_SEC(service_time)*queue_length/60),0)),DECIMAL(10,2)) as max_service_time
	from GWR.Queue_matrix
	where created_at between '${date} 08:30:00' and '${date} 22:30:00' and outlet  in (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22)
	group by outlet;`;
		


	
			let data = connection
					.query(sqlQuery);
	
		res.status(200).json({ message: "List", data: data });
	
};

module.exports.getmaxexpectedwaittimebyid =  (req, res) => {
	
	let date = req.query.date;
	let sqlQuery = `select outlet,CONVERT(max(TIME_TO_SEC(service_time)*queue_length/60),DECIMAL(10,2)) as max_service_time
	from GWR.Queue_matrix
	where created_at between '${date} 08:30:00' and '${date} 22:30:00' and outlet  in (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22)
	group by outlet;`;

	
		
			let data = connection
					.query(sqlQuery);
	
		res.status(200).json({ message: "List", data: data });
	
};


module.exports.getallsummarydata =  (req, res) => {
	
	let date = req.query.date;
	let outlet = req.query.outlet;

	let sqlQuery = `SELECT
    location,
    MAX(service_time)AS max_service_time,
    AVG(service_time)AS avg_service_time,
    MAX(wait_time) AS max_wait_time,
    AVG(wait_time)AS avg_wait_time
FROM (
    SELECT
        DATE_ADD(
            "1000-01-01 00:00:00",
            INTERVAL CEILING(
                TIMESTAMPDIFF(
                    MINUTE,
                    "1000-01-01 00:00:00",
                    CONCAT(
                        DATE_FORMAT(q.created_at, '%Y-%m-%d'),
                        ' ',
                        DATE_FORMAT(q.created_at, '%H:%i:%s')
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
        o.location
    FROM
        GWR.Queue_matrix q
        JOIN GWR.outlets o ON q.outlet = o.id
    WHERE
        q.created_at BETWEEN '${date} 08:30:00' AND '${date} 22:30:00'
        AND o.name='${outlet}'
        AND TIME(q.created_at) BETWEEN '08:30:00' AND '22:30:00'
        AND DATE_FORMAT(q.created_at, '%H:%i:%s')
    GROUP BY
        login_datetime_15_min_interval, o.location
) AS subquery
GROUP BY
    location
ORDER BY
    max_wait_time;`;


		
	

			let data = connection
					.query(sqlQuery);
	
		res.status(200).json({ message: "List", data: data });
	
};





