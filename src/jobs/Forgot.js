const sendMail = require('../lib/Mail');

module.exports = {
  key: 'Forgot',
  async handle({ data }) {
    const { user, redirect, token } = data;
    await sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Reset VUTTR password',
      template: 'forgot',
      context: {
        username: user.name,
        link: `${redirect}?token=${token}`
      }
    });
  }
};