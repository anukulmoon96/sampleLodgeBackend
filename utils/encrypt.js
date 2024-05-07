const crypto = require("crypto");
require("dotenv").config();
const { ALGORITHM } = process.env;
// const algorithm = "aes-256-cbc";
const Securitykey = crypto.randomBytes(32);
const initVector = crypto.randomBytes(16);
const cipher = crypto.createCipheriv(ALGORITHM, Securitykey, initVector);
const decipher = crypto.createDecipheriv(ALGORITHM, Securitykey, initVector);

module.exports.encryptData = (data) => {
	let encryptedData = cipher.update(JSON.stringify(data), "utf-8", "hex");
	encryptedData += cipher.final("hex");
	return encryptedData;
};

module.exports.decryptData = (data) => {
	let decryptedData = decipher.update(data, "hex", "utf-8");
	decryptedData += decipher.final("utf8");
	return decryptedData;
};
