const User = require('../models/User');
const crypto = require('crypto');
const isAfter = require('date-fns/isAfter');
const subDays = require('date-fns/subDays');
const Queue = require('../lib/Queue');

module.exports = {
  store: async (req, res) => {
    const { email } = req.value.body
    const { redirect_url } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.token = crypto.randomBytes(32).toString('hex');
    user.token_created_at = new Date();

    await user.save();

    await Queue.add('AccountConfirmation', { user, redirect_url });

    return res.status(204).send();
  },

  update: async (req, res) => {
    const { token } = req.params;
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