const moment = require("moment/moment");
var connection = require("../Config/db");
const validator = require("validator");

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


module.exports.score = (req, res) => {
let date = req.query.date;

//     let data = connection.query(`SELECT
//     o.location,
//     #MAX(CASE WHEN subquery.service_time > 0 THEN subquery.service_time * 60 ELSE 0 END) AS max_service_time,
//     AVG(CASE WHEN subquery.service_time > 0 THEN subquery.service_time * 60 ELSE 0 END) AS avg_service_time,
//     #MAX(CASE WHEN subquery.wait_time > 0 THEN subquery.wait_time * 60 ELSE 0 END) AS max_wait_time,
//     AVG(CASE WHEN subquery.wait_time > 0 THEN subquery.wait_time * 60 ELSE 0 END) AS avg_wait_time,
//     (
//         SELECT COUNT(*)
//         FROM GWR.extreme_events e
//         WHERE e.outlet = subquery.outlet # and name='Front Desk'
//         AND e.created_at BETWEEN '2023-12-08 08:30:00' AND '2023-12-08 22:30:00'
//     ) AS total_events,
//     (SELECT COUNT(*)
//         FROM GWR.Attendant e
//         WHERE e.outlet = subquery.outlet # and name='Front Desk'
//         AND e.created_at BETWEEN '2023-12-08 08:30:00' AND '2023-12-08 22:30:00'
//     ) AS total_events_attendant_absent,
    
//     footfall.total_count as footfall
//     #COALESCE(total_events / footfall.total_count, 0) AS events_to_footfall_ratio
// FROM (
//     -- Your existing subquery
//     SELECT
//         DATE_ADD(
//             "1000-01-01 00:00:00",
//             INTERVAL CEILING(
//                 TIMESTAMPDIFF(
//                     MINUTE,
//                     "1000-01-01 00:00:00",
//                     CONCAT(
//                         DATE_FORMAT(q.created_at, '%Y-%m-%d'),
//                         ' ',
//                         DATE_FORMAT(q.created_at, '%H:%i:%s')
//                     )
//                 ) / 15
//             ) * 15 MINUTE
//         ) AS login_datetime_15_min_interval,
//         CONVERT(
//             AVG(TIME_TO_SEC(service_time)/60),
//             DECIMAL(10,2)
//         ) AS service_time,
//         ROUND(AVG(queue_length)) AS queue_length,
//         CONVERT(
//             AVG(TIME_TO_SEC(service_time)/60) * ROUND(AVG(queue_length)) / (
//                 CASE
//                     WHEN ROUND(manned_terminals) IS NULL OR ROUND(manned_terminals) = 0
//                     THEN 1
//                     ELSE ROUND(manned_terminals)
//                 END
//             ),
//             DECIMAL(10,2)
//         ) AS wait_time,
//         q.outlet
//     FROM
//         GWR.Queue_matrix q
//         JOIN GWR.outlets o ON q.outlet = o.id
//     WHERE
//         q.created_at BETWEEN '2023-12-08 08:30:00' AND '2023-12-08 22:30:00'
//         AND o.name='Front Desk'
//         AND TIME(q.created_at) BETWEEN '08:30:00' AND '22:30:00'
//         AND DATE_FORMAT(q.created_at, '%H:%i:%s')
//     GROUP BY
//         login_datetime_15_min_interval, q.outlet
// ) AS subquery
// LEFT JOIN (
//     SELECT
//         outlet,
//         SUM(count) AS total_count
//     FROM
//         footfall
//     WHERE
//         created_at BETWEEN '2023-12-08 08:30:00' AND '2023-12-08 22:30:00'
//     GROUP BY
//         outlet
// ) AS footfall ON subquery.outlet = footfall.outlet
// -- Join with outlets table to get location information
// JOIN GWR.outlets o ON subquery.outlet = o.id
// GROUP BY
//     o.location
// ORDER BY
//     avg_wait_time;`);

let data = connection.query(`SELECT
    Date,
    location,
    CONVERT(CASE WHEN outlet_type = 'Guest Services' THEN score END,DECIMAL(10,2)) AS guest_service_score,
    CONVERT(AVG(CASE WHEN outlet_type = 'F&B' THEN score END),DECIMAL(10,2)) AS fb_score,
	CONVERT((CASE WHEN outlet_type = 'Guest Services' THEN score END +AVG(CASE WHEN outlet_type = 'F&B' THEN score END))/2,DECIMAL(10,2)) AS lodge_score
FROM GWR.score
where Date = '${date}'
GROUP BY Date, location
ORDER BY lodge_score desc;`);

	
	res.send(data);	
};



module.exports.score3 = (req, res) => {
  let start_date = req.query.start_date;
  let end_date = req.query.end_date;


  let dates = getDates(new Date(start_date), new Date(end_date));

		let dates2 = [];
		dates.forEach(function (item) {
			dates2.push(convertDate(item));
		});

    let data = [];

for(item of dates2){
data.push(connection.query(`SELECT
Date,
location,
CONVERT(CASE WHEN outlet_type = 'Guest Services' THEN score END,DECIMAL(10,2)) AS guest_service_score,
CONVERT(AVG(CASE WHEN outlet_type = 'F&B' THEN score END),DECIMAL(10,2)) AS fb_score,
CONVERT((CASE WHEN outlet_type = 'Guest Services' THEN score END +AVG(CASE WHEN outlet_type = 'F&B' THEN score END))/2,DECIMAL(10,2)) AS lodge_score
FROM GWR.score
where Date = '${item}'
GROUP BY Date, location;`));

}
  
  
    
    res.send(data);	
  };
  
  
  




module.exports.score2 = (req,res) => {
let location = req.query.location;
let date = req.query.date;
let outlet_type =req.query.outlet_type; 
let data = connection.query(`
SELECT
  Date,
  location,
  outlet_name,
  score
FROM
  GWR.score
WHERE
  location = '${location}' AND
  Date = '${date}' AND
  outlet_type = '${outlet_type}';
`);

    res.send(data);
}


module.exports.getlinegraphdata = (req,res) => {


       let lodge = req.query.lodge;
	   let start_date = req.query.start_date;
	   let end_date = req.query.end_date;

	   let input_data = connection.query(`WITH RECURSIVE date_series AS (
		SELECT '${start_date}' AS generated_date
		UNION
		SELECT generated_date + INTERVAL 1 DAY
		FROM date_series
		WHERE generated_date < '${end_date}'
	  )
	  SELECT ds.generated_date AS Date,
			 s.location,
			 COALESCE(CONVERT(MAX(CASE WHEN s.outlet_type = 'Guest Services' THEN s.score END), DECIMAL(10,2)), null) AS guest_service_score,
			 COALESCE(CONVERT(AVG(CASE WHEN s.outlet_type = 'F&B' THEN s.score END), DECIMAL(10,2)), null) AS fb_score,
			 COALESCE(CONVERT((MAX(CASE WHEN s.outlet_type = 'Guest Services' THEN s.score END) + AVG(CASE WHEN s.outlet_type = 'F&B' THEN s.score END))/2, DECIMAL(10,2)), null) AS lodge_score
	  FROM date_series ds
	  CROSS JOIN (
		SELECT DISTINCT location
		FROM GWR.score
		WHERE outlet_type IN ('Guest Services', 'F&B') 
		  AND Date BETWEEN '${start_date}' AND '${end_date}' 
		  AND location = '${lodge}'
	  ) locations
	  LEFT JOIN GWR.score s 
		ON ds.generated_date = s.Date 
		   AND locations.location = s.location
		   AND s.location = '${lodge}'
		   AND s.outlet_type IN ('Guest Services', 'F&B')
	  GROUP BY ds.generated_date, s.location
	  ORDER BY ds.generated_date, s.location;
	  `);


   const convertDataFormat = (inputData) => {
	const outputData = [
	  {
		"name": "Lodge Score",
		"data": []
	  },
	  {
		"name": "Guest Services",
		"data": []
	  },
	  {
		"name": "F&B",
		"data": []
	  }
	];
	inputData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
	inputData.forEach((entry) => {
	  outputData[0].data.push(entry.lodge_score);
	  outputData[1].data.push(entry.guest_service_score);
	  outputData[2].data.push(entry.fb_score);
	});
	return outputData;
  };
  const result = convertDataFormat(input_data);
  console.log(JSON.stringify(result, null, 4));
	
	res.send(result);	


}


module.exports.getguestservicestabledata = (req,res) => {

let lodge = req.query.lodge;
let start_date = req.query.start_date;
let end_date = req.query.end_date;
let pageNumber = req.query.pageNumber;
let limit = req.query.limit;
let total = 0;
 total = connection.query(`SELECT COUNT(*) as count FROM GWR.score where location = '${lodge}' and date between '${start_date}' and '${end_date}' and outlet_type = 'Guest Services' order by Date desc;`)[0].count;


let data = connection.query(`SELECT Date,TIME_FORMAT(SEC_TO_TIME(avg_service_time), '%H:%i:%s') as avg_service_time,TIME_FORMAT(SEC_TO_TIME(avg_wait_time), '%H:%i:%s') as avg_wait_time,total_events,events_to_footfall_ratio,Convert(inefficiency,Decimal(10,2)) as inefficiency,Convert(score,Decimal(10,2)) as score FROM GWR.score where location = '${lodge}' and date between '${start_date}' and '${end_date}' and outlet_type = 'Guest Services' order by Date desc limit ${pageNumber*limit} , ${limit};`);
res.send({data:data,total:total});

}

module.exports.getfandbtabledata = (req,res) => {

	let lodge = req.query.lodge;
	let start_date = req.query.start_date;
	let end_date = req.query.end_date;
	
	
	let data = connection.query(`WITH RECURSIVE date_series AS (
		SELECT '${start_date}' AS generated_date
		UNION
		SELECT generated_date + INTERVAL 1 DAY
		FROM date_series
		WHERE generated_date < '${end_date}'
	  )
	  SELECT ds.generated_date AS Date,
			 outlets.outlet_name,
			 COALESCE(CONVERT(s.score, DECIMAL(10,2)), null) AS score
	  FROM date_series ds
	  CROSS JOIN (
		SELECT DISTINCT outlet_name
		FROM GWR.score
		WHERE location = '${lodge}' 
		  AND outlet_type ='F&B'
	  ) outlets
	  LEFT JOIN GWR.score s 
		ON ds.generated_date = s.Date 
		   AND outlets.outlet_name = s.outlet_name
		   AND s.location = '${lodge}' 
		   AND s.outlet_type ='F&B'
	  ORDER BY ds.generated_date, outlets.outlet_name;
	  `);



	
	res.send(data);
	
	}

	module.exports.getfandbareatabledata = (req,res) => {

let location = req.query.location;
let outlet = req.query.outlet;
let start_date = req.query.start_date;
let end_date = req.query.end_date;
let pageNumber = req.query.pageNumber;
let limit = req.query.limit;
let total = 0;
 total = connection.query(`SELECT count(*) as count FROM GWR.score where location = '${location}' and outlet_name='${outlet}' and Date between '${start_date}' and '${end_date}' order by Date desc;`)[0].count;

let data = connection.query(`SELECT Date,TIME_FORMAT(SEC_TO_TIME(avg_service_time), '%H:%i:%s') as avg_service_time,TIME_FORMAT(SEC_TO_TIME(avg_wait_time), '%H:%i:%s') as avg_wait_time,total_events,events_to_footfall_ratio,Convert(inefficiency,Decimal(10,2)) as inefficiency,Convert(score,Decimal(10,2)) as score FROM GWR.score where location = '${location}' and outlet_name='${outlet}' and Date between '${start_date}' and '${end_date}' order by Date desc limit ${pageNumber*limit},${limit};`);
res.send({data:data,total:total});

	}



	
module.exports.score4 = (req, res) => {
	let start_date = req.query.start_date;
	let end_date = req.query.end_date;

	var currentDate = new Date(start_date);

// Subtract 7 days from today
var sevenDaysAgo = new Date(currentDate);
sevenDaysAgo.setDate(currentDate.getDate() - 7);

// Format the date as desired (e.g., YYYY-MM-DD)
var formattedDate = sevenDaysAgo.toISOString().split('T')[0];

	
	// let data = connection.query(`SELECT
	// 	location,
	// 	CONVERT(AVG(CASE WHEN outlet_type = 'Guest Services' THEN score END),DECIMAL(10,2)) AS guest_service_score,
	// 	CONVERT(AVG(CASE WHEN outlet_type = 'F&B' THEN score END),DECIMAL(10,2)) AS fb_score,
	//    CONVERT((AVG(CASE WHEN outlet_type = 'Guest Services' THEN score END) +  AVG(CASE WHEN outlet_type = 'F&B' THEN score END)) /2,decimal(10,2))  AS lodge_score
	// FROM GWR.score
	// WHERE Date BETWEEN '${start_date}' AND '${end_date}'
	// GROUP BY location
	// ORDER BY lodge_score DESC;`);

	let data1 = connection.query(`SELECT
    location,
    CONVERT(AVG(CASE WHEN outlet_type = 'Guest Services' THEN score END), DECIMAL(10,2)) AS guest_service_score,
    CONVERT(AVG(CASE WHEN outlet_type = 'F&B' THEN score END), DECIMAL(10,2)) AS fb_score,
    CONVERT((CASE WHEN AVG(CASE WHEN outlet_type = 'Guest Services' THEN score END) IS NOT NULL AND AVG(CASE WHEN outlet_type = 'F&B' THEN score END) IS NOT NULL THEN
                (AVG(CASE WHEN outlet_type = 'Guest Services' THEN score END) + AVG(CASE WHEN outlet_type = 'F&B' THEN score END)) / 2
            ELSE
                CASE WHEN AVG(CASE WHEN outlet_type = 'Guest Services' THEN score END) IS NOT NULL THEN AVG(CASE WHEN outlet_type = 'Guest Services' THEN score END)
                ELSE AVG(CASE WHEN outlet_type = 'F&B' THEN score END)
                END
            END), DECIMAL(10,2)) AS lodge_score
FROM GWR.score
WHERE Date BETWEEN '${start_date}' AND '${end_date}'
GROUP BY location
ORDER BY lodge_score DESC;`);


let data2 = connection.query(`SELECT
    location,
    CONVERT(AVG(CASE WHEN outlet_type = 'Guest Services' THEN score END), DECIMAL(10,2)) AS guest_service_score2,
    CONVERT(AVG(CASE WHEN outlet_type = 'F&B' THEN score END), DECIMAL(10,2)) AS fb_score2,
    CONVERT((CASE WHEN AVG(CASE WHEN outlet_type = 'Guest Services' THEN score END) IS NOT NULL AND AVG(CASE WHEN outlet_type = 'F&B' THEN score END) IS NOT NULL THEN
                (AVG(CASE WHEN outlet_type = 'Guest Services' THEN score END) + AVG(CASE WHEN outlet_type = 'F&B' THEN score END)) / 2
            ELSE
                CASE WHEN AVG(CASE WHEN outlet_type = 'Guest Services' THEN score END) IS NOT NULL THEN AVG(CASE WHEN outlet_type = 'Guest Services' THEN score END)
                ELSE AVG(CASE WHEN outlet_type = 'F&B' THEN score END)
                END
            END), DECIMAL(10,2)) AS lodge_score2
FROM GWR.score
WHERE Date BETWEEN '${formattedDate}' AND '${start_date}'
GROUP BY location
ORDER BY lodge_score2 DESC;`);

data2.forEach((item2) => {
    // Find the corresponding element in data1
    const correspondingItemIndex = data1.findIndex((item1) => item1.location === item2.location);
    
    // If the location exists in data1, merge the properties from data2
    if (correspondingItemIndex !== -1) {
        Object.assign(data1[correspondingItemIndex], item2);
    }
});
		
data2 && res.send(data1);
	};

	module.exports.scorecalculationdata = (req, res) => {
		let start_date = req.query.start_date;
		let end_date = req.query.end_date;
		let outlet_number = req.query.outlet_number;
		
		let data = connection.query(`SELECT Date, location, outlet_id, outlet_type, outlet_name,  SUBSTRING(SEC_TO_TIME(avg_service_time), 1, 8) AS avg_service_time,
		SUBSTRING(SEC_TO_TIME(avg_wait_time), 1, 8) AS avg_wait_time, total_events, events_to_footfall_ratio, inefficiency, score FROM GWR.score where outlet_id = ${outlet_number} and date between '${start_date}' and '${end_date}';`);
		
			
			res.send(data);	
		};

	
