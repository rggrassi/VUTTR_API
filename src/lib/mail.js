const nodemailer = require("nodemailer");
const mailgunTransport = require("nodemailer-mailgun-transport");
const config = require("../config/mail");

const { auth } = config;
const transporter = nodemailer.createTransport(mailgunTransport({ auth }));

export default function sendMail(email) {
  return transporter.sendMail({ ...config.default, ...email });
}
