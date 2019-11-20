const sendMail = require("../lib/Mail");

module.exports = {
  key: 'ForgotPassword',
  options: {
    delay: 5000,
    attemps: 3
  },
  async handle({ data }) {
    const { user, redirect_url, token } = data;
    await sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Reset VUTTR password',
      template: 'forgot_password',
      context: {
        username: user.name,
        link: `${redirect_url}?token=${token}`
      }
    });
  }
};