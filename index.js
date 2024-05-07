const express = require("express");
const nodemailer = require("nodemailer");
const morgan = require("morgan");
const cors = require("cors");
const cron = require("node-cron");
var connection = require("./Config/db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const sessions = require("express-session");
const nocache = require("nocache");
const mysql = require("mysql");
const helmet = require("helmet");
const fs = require("fs");
var s3 = require("./Config/s3");
require("dotenv").config();

var fileupload = require("express-fileupload");


const { PORT } = process.env;

const mainRoutes = require("./Routes/index");

const app = express();
app.use(fileupload());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(helmet());
app.use(helmet.frameguard({ action: "SAMEORIGIN" }));
app.use(nocache());
app.use("*", cors());
//app.use(cors());
app.set("host", "*.*.*.*");
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(cookieParser());
const { OAuth2Client } = require('google-auth-library');

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});
var upload = multer({ storage: storage }) 

// app.use("*", cors());
// app.use(cors({
//     origin:"https://dev-gwr.app-assertai.com"
// }));
// app.use((req, res, next)=> {
// 	res.setHeader(
// 		"Access-Control-Allow-Origin",
// 		"https://dev-gwr.app-assertai.com"
// 	);
// 	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
// 	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
// 	res.setHeader("Access-Control-Allow-Credentials", true);
// 	res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
// 	res.setHeader('X-Frame-Options', 'DENY');

// 	next();
// });

// app.set("host", "*.*.*.*");


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const { HOST, USER, PASSWORD, DATABASE } = process.env;

var con = mysql.createConnection({
	host: HOST,
	user: USER,
	password: PASSWORD,
	database: DATABASE,
	multipleStatements: false,
});

con.connect(function (err) {
	if (err) throw err;
	console.log("Connection done");
});

app.use(
	morgan(
		":method :url :status :res[content-length] - :response-time ms [:date[clf]]"
	)
);

// creating 1 day from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(
	sessions({
		secret: process.env.SECRETACCESSKEY,
		saveUninitialized: true,
		cookie: { maxAge: oneDay },
		resave: false,
	})
);

app.use(function (req, res, next) {
	if (
		req.method === "POST" ||
		req.method === "GET" ||
		req.method === "PUT" ||
		req.method === "DELETE" ||
		req.method === "PATCH"
	)
		next();
	else res.send(false);
});

app.post("/test", async (req, res) => {

res.send('ok');
});




app.get("/updatecomment", async (req, res) => {
	let id = req.query.id;
	let text = req.query.text;
	let commentedby = req.query.commentedby;

	let now = new Date();

	// Convert to IST (Indian Standard Time)
	let istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
	let istTime = new Date(now.getTime() + istOffset);
	
	// Format the date string
	let istTimeString = istTime.toISOString().slice(0, 19).replace('T', ' ')


	let sqlQuery =
		`update GWR.extreme_events set Comments = '${text}', commentUpdatedAt= '${istTimeString}', CommentedBy = '${commentedby}' where idextreme_events = ${id}`;

	res.send(connection.query(sqlQuery));
});


app.post("/send_mail", async (req, res) => {
	let { email } = req.body;
	let sqlQuery = `select id from GWR.users where email='${email}' and reset_password_attempts <= 5 and last_reset_password_attempt + INTERVAL 60 MINUTE < now()`;
	let userId;
	con.query(sqlQuery, async function (err, result) {
		if (err) {
			res.status(404).json({ Message: "Error in Sending Mail." });
		} else if (result.length > 0) {
			var expiresTime = new Date();
			expiresTime.setHours(expiresTime.getHours() + 1);
			console.log("Expires Time ", Date.parse(expiresTime));
			userId = result[0].id;
			connection.query(
				`UPDATE GWR.users SET reset_password_attempts = reset_password_attempts + 1 ,last_reset_password_attempt = now() WHERE id = '${userId}'`
			);
			const transport = nodemailer.createTransport({
				service: "gmail",
				// host: process.env.MAIL_HOST,
				// secure: false,
				// port: process.env.MAIL_PORT,
				auth: {
					user: process.env.MAIL_USER,
					pass: process.env.MAIL_PASS,
				},
				tls: {
					rejectUnauthorized: false,
				},
			});

			await transport.sendMail({
				from: process.env.MAIL_FROM,
				to: email,
				subject: `Reset Password Mail.`,
				html: `<div className="email" style="
        border: 1px solid black;
        padding: 20px;
        font-family: sans-serif;
        line-height: 2;
        font-size: 20px;
        ">
								<p>Click below link to reset your password.</p>
								<a href='https://gwr.app-assertai.com/resetpassword/${userId}/${Date.parse(
					expiresTime
				)}'>Rest Password Link </a>
				   <p>The above link will be expired in one hour.</p>
         </div>
    `,
			});
			res.status(200).json({ Message: "Link is sent to your mail." });
		} else {
			res.status(404).json({ Message: "Your Account Has Been Locked for 1 hr." });
		}
	});
});


app.post("/send_feedback",async (req, res) => {


	let file = req.files?.recfile;

	let { checkbox,
		location,
		date,
		comments,
		Outlet,
		SentBY } = req.body;


		let issue = [];

		for (let [k, v] of Object.entries(JSON.parse(checkbox))) {
			issue[k] =  v;

		  }	

	let mag1 = file?.data[0];
	let mag2 = file?.data[1];
	let magtot = "" + mag1 + mag2;
	let files = 0;
	let updated = 0;

	// if (magtot === "255216" ||
	// magtot === "3780" ||
	// magtot === "13780" ||
	// magtot === "12310")
	if (magtot)
	{
		file.mv(__dirname + "/uploads/" + file.name, function (err) {
			if (err) return res.status(500).send(err);
 
				  fs.readFile(__dirname + "/uploads/" + file.name, (err, data) => {
					if (err) throw err;
					const params = {
						Bucket: "bucket-big-basket",
						Key: file.name,
						Body: data,
					};
					s3.upload(params, async function (s3Err, data) {
						if (s3Err) throw s3Err;

						let sql1 = `INSERT INTO GWR.Feedback
						(
						Location,
						Outlet,
						Date_of_issue,
						Issues,
						Comments,
						Attachment,
						SentBy)
						VALUES
						(
						'${location}',
						'${Outlet}',
						'${new Date(date)}',
						'${checkbox}',
						'${comments}',
						'${data.Location}',
						'${SentBY}');
						`;

						let result = connection.query(sql1);

						const transport = nodemailer.createTransport({
							service: "gmail",
							// host: process.env.MAIL_HOST,
							// secure: false,
							// port: process.env.MAIL_PORT,
							auth: {
								user: process.env.MAIL_USER,
								pass: process.env.MAIL_PASS,
							},
							tls: {
								rejectUnauthorized: false,
							},
						});
			
						await transport.sendMail({
							from: process.env.MAIL_FROM,
							to: 'rohit.pingulkar@assertai.com',
							cc:["anukul.moon@assertai.com"],
							subject: `Feedback Mail.`,
							attachments: [
								{
									filename: file.name,
									path: __dirname + "/uploads/" + file.name
								 }
							   ],
							html: `<div className="email" style="
					border: 1px solid black;
					padding: 20px;
					font-family: sans-serif;
					line-height: 2;
					font-size: 20px;
					">
			
							   <p>Location:- ${location}</p>
							   <p>Outlet:- ${Outlet}</p>
							   <p>Date:- ${new Date(date)}</p>
							   Issues:-
							   <p>${issue['checkbox1'] ? 'Service Time issue' : ""}</p>
							   <p>${issue['checkbox2'] ? 'Wait TIme issue' : ""}</p>
							   <p>${issue['checkbox3'] ? 'Queue Length issue' : ""}</p>
							   <p>${issue['checkbox4'] ? 'Attendant absent issue' : ""}</p>
							   <p>${issue['checkbox5'] ? 'Dashboard issue' : ""}</p>
								<p>${issue['checkbox6'] ? 'Other issue' : ""}</p>
							   <p>Comments:- ${comments}</p>
							   <p>Sent By:- ${SentBY}</p>
					 </div>
				`,
						});

						res.send({ success: true, url: data.Location,message:"Data Updated Successfully!" });
					});

				//	fs.unlink(__dirname + "/uploads/" + file.name);
					
				});
			
		});
	} else {
		res.status(400).json({ message: "invalid file type" });
	}
//	res.status(200).json({ Message: "Link is sent to your mail." });


	return;
	

		

	


		//checkbox && checkbox.forEach((item)=>{
			// console.log(item);
            // if(item.checkbox1 == true){
			// 	issue.push('Service Time issue');
			// }
			// if(item.checkbox2 == true){
			// 	issue.push('Wait TIme issue');
			// }
			// if(item.checkbox3 == true){
			// 	issue.push('Queue Length issue');
			// }
			// if(item.checkbox4 == true){
			// 	issue.push('Attendant absent issue');
			// }
			// if(item.checkbox5 == true){
			// 	issue.push('Dashboard issue');
			// }

			// if(item.checkbox6 == true){
			// 	issue.push('Other issue');
			// }
			
		//})
	
			
	//		res.status(200).json({ Message: "Link is sent to your mail." });
		

});



app.post('/google-login', async (req, res) => {
	const { token } = req.body;
	let session = req.session;
	const ticket = await client.verifyIdToken({
	  idToken: token,
	  audience: process.env.CLIENT_ID,
	});

	console.log(ticket);
	const { given_name, email, picture } = ticket.getPayload();
	// upsert(users, { name, email, picture });

	let sqlQuery =
			"select id,name,email,access,last_login,location,designation from GWR.users where email=?";
		con.query(sqlQuery, [email], (err, result) => {
			if (err) {
				res.send("Error Caught");
			} else {
				if (result.length > 0) {

					const token2 = jwt.sign(
						{
							id: JSON.parse(JSON.stringify(result))[0].id,
							email: email,
							location: JSON.parse(JSON.stringify(result))[0].location,
							designation:JSON.parse(JSON.stringify(result))[0].designation,
						},
						process.env.JWTKEY,
						{
							expiresIn: "1h",
						}
					);
					res.status(201);
					res.json({ given_name, email, picture,token2, session });


				} 
				 else {

					res.json({message:"User doesnt exixts!!"});

				// 		// Store hash in your password DB.
					
				// 			let saveSqlQuery =
				// 				"Insert into GWR.users(name,email,location,show_on_dashboard) values (?,?,?,'yes');";
				// 			con.query(
				// 				saveSqlQuery,
				// 				[given_name, email, '["GWR Lagrange", "GWR Manteca"]'],
				// 				(err, result) => {

				// 					console.log(result);
				// 					if (err) {
				// 						res.send("Error caught");
				// 					} else {
										
				// 						const token2 = jwt.sign(
				// 							{
				// 								id: result.insertId,
				// 								email: email,
				// 								location: '["GWR Lagrange", "GWR Manteca"]',
				// 							},
				// 							process.env.JWTKEY,
				// 							{
				// 								expiresIn: "1h",
				// 							}
				// 						);
				// 						res.status(201);
				// 						res.json({ given_name, email, picture,token2, session });


				// 					}
				// 				}
				// 			);
						
					
				 }
			}
		});

	
  });



  app.post('/microsoft-login', async (req, res) => {
	const { email,name } = req.body;

	console.log(name);
	let session = req.session;
	

					const token2 = jwt.sign(
						{
							id: 0,
							email: email,
							location: '["GWR Manteca", "GWR Lagrange"]',
						},
						process.env.JWTKEY,
						{
							expiresIn: "1h",
						}
					);
					res.status(201);
					res.json({ token2, session });



	
  });





cron.schedule("*/10 * * * * *", function () {
	connection.query(
		"UPDATE GWR.users set incorrect_password_attempts = 0 where incorrect_password_attempts >= 5 and last_incorrect_login + INTERVAL 15 MINUTE < now();"
	);
	connection.query(
		"UPDATE GWR.users set reset_password_attempts = 0 where reset_password_attempts >= 5 and last_reset_password_attempt + INTERVAL 1440 MINUTE < now();"
	);
});

app.use(mainRoutes);

app.listen(PORT, (err) => {
	if (err) {
		console.log("There is error in running the server!!");
	}
	console.log(`Server is running at port :- ${PORT}`);
});
