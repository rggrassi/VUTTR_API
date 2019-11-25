const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');

module.exports = {
  createTransport: () => {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport(mailgunTransport({
        auth: {
          api_key: process.env.MAILGUN_KEY,
          domain: process.env.MAILGUN_DOMAIN
        },
      }))
    }

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: null,
    })
  },
  default: {
    from: 'VUTTR <do-not-reply@vuttr.com>'
  }
}