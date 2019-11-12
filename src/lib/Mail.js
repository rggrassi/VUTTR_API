const nodemailer = require("nodemailer");
const nodemailerhbs = require('nodemailer-express-handlebars')
const exphbs = require('express-handlebars');
const mailgunTransport = require("nodemailer-mailgun-transport");
const config = require('../config/mail');
const { resolve } = require('path');

const { auth, proxy } = config;
const transporter = nodemailer.createTransport(mailgunTransport({ auth, proxy }));

const viewPath = resolve(__dirname, '..', 'views', 'emails');
transporter.use('compile', nodemailerhbs({
  viewEngine: exphbs.create({
    layoutsDir: resolve(viewPath, 'layout'),
    partialsDir: resolve(viewPath, 'partials'),
    defaultLayout: 'default',
    extname: '.hbs'
  }),
  viewPath,
  extName: '.hbs'
}));

module.exports = function sendMail(email) {
  return transporter.sendMail({ ...config.default, ...email });
}
