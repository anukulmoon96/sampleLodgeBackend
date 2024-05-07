const moment = require("moment/moment");
var connection = require("../Config/db");
const validator = require("validator");


module.exports.health = (req, res) => {


   let healthdata = connection.query(`
    SELECT 
        dh.lodge,
        MAX(CASE WHEN dh.device_name = 'RTX' THEN dh.status END) AS rtx_status,
        MAX(CASE WHEN dh.device_name = 'NX' THEN dh.status END) AS nx_status,
        ch.camera,
        ch.status AS camera_status,
        SUBSTRING_INDEX(SUBSTRING_INDEX(ch.rtsp, '@', -1), ':', 1) AS camera_ip
    FROM 
        device_health dh
    LEFT JOIN 
        camera_health ch ON dh.lodge = ch.lodge
    WHERE 
        (dh.device_name IN ('RTX', 'NX')) AND
        ((dh.device_name = 'RTX' AND dh.status = 'online') OR (dh.device_name = 'NX')) AND
        (dh.device_name = 'RTX' OR (dh.device_name = 'NX' AND dh.status = 'online'))
    GROUP BY
        dh.lodge, ch.camera, ch.status, SUBSTRING_INDEX(SUBSTRING_INDEX(ch.rtsp, '@', -1), ':', 1)
    ORDER BY 
        dh.lodge;`);
	

	res.send(healthdata);
};



