const nodemailer = require("nodemailer");
const mailgunTransport = require("nodemailer-mailgun-transport");

module.exports = {
  createTransport: () => {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport(mailgunTransport({
        auth: {
          api_key: process.env.MAILGUN_KEY,
          domain: process.env.MAILGUN_DOMAIN
        },
        proxy: 'http://192.168.0.1:3128',
      }))
    }
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      },
    })   
  },
  default: {
    from: 'VUTTR <do-not-reply@vuttr.com>'
  }
}