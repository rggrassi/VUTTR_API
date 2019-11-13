const nodemailerhbs = require('nodemailer-express-handlebars')
const exphbs = require('express-handlebars');
const Mail = require('../config/mail');
const { resolve } = require('path');

const transporter = Mail.createTransport();

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
  return transporter.sendMail({ ...Mail.default, ...email });
}