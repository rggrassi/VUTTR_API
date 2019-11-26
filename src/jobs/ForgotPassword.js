const sendMail = require("../lib/Mail");

module.exports = {
  key: 'ForgotPassword',
  async handle({ data }) {
    const { user, redirect, token } = data;
    await sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Reset VUTTR password',
      template: 'forgot_password',
      context: {
        username: user.name,
        link: `${redirect}?token=${token}`
      }
    });
  }
};