const User = require('../models/User');
const crypto = require('crypto');
const sendMail = require('../lib/Mail');
const isAfter = require('date-fns/isAfter');
const subDays = require('date-fns/subDays');

module.exports = {
  store: async (req, res) => {
    const { email } = req.value.body
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.token = crypto.randomBytes(32).toString('hex');
    user.token_created_at = new Date();

    await user.save();

    await sendMail({
      to: `${user.name} <${user.email}>`,
      subject: "Check your email address",
      template: "verify_email",
      context: {
        link: `${req.body.redirect_url}?token=${req.value.body.token}`
      }
    });

    return res.status(204).send();
  },

  update: async (req, res) => {
    const { token } = req.value.body;
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(400).json({ message: 'Token not valid' });
    }

    const expired = isAfter(
      subDays(new Date(), 2),
      user.token_created_at
    );
    if (expired) {
      return res.status(401).json({ message: 'Mail cofirmation token is expired' });
    }

    user.token = null;
    user.token_created_at = null;
    user.verified = true;

    await user.save();

    return res.status(204).send();
  }
}