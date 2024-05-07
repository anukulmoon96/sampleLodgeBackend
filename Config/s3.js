const AWS = require("aws-sdk");
require("dotenv").config();

const { ACCESSKEYID, SECRETACCESSKEY } = process.env;

const s3 = new AWS.S3({
	// region: 'ap-south-1',
	accessKeyId: ACCESSKEYID,
	secretAccessKey: SECRETACCESSKEY,
});

module.exports = s3;
