const sendMail = require('../lib/Mail');

module.exports = {
  key: 'Forgot',
  async handle({ data }) {
    const { user } = data;
    await sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'VUTTR Password Reset Confirmation',
      template: 'forgot_confirmation',
      context: {
        username: user.name,
      }
    });
  }
};