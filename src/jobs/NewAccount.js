const sendMail = require('../lib/Mail');

module.exports = {
  key: 'NewAccount',
  async handle({ data }) {
    const { user, redirect, token } = data;
    await sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Check your email address',
      template: 'new_account',
      context: {
        link: `${redirect}?token=${token}`
      }
    });
  }
};