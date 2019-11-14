const nodemailerhbs = require('nodemailer-express-handlebars')
const exphbs = require('express-handlebars');
const mail = require('../config/mail');
const { resolve } = require('path');

const transporter = mail.createTransport();

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
  return transporter.sendMail({ ...mail.default, ...email });
}