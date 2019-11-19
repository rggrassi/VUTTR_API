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
  
    /*await sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Reset VUTTR password',
      template: 'forgot_password',
      context: {
        username: user.name,
        link: `${req.body.redirect_url}?token=${user.token}`
      }
    });*/  
    return res.status(204).send();
  },
  update: async (req, res) => {  
    const { token, password } = req.value.body;
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(400).json({ message: 'Token not valid' });
    }
  
    const expired = isAfter(
      subDays(new Date(), 2),
      user.token_created_at
    );
    if (expired) {
      return res.status(401).json({ message: 'Recovery token is expired' })
    }
  
    user.token = null;
    user.token_created_at = null;
    user.password = password;
  
    await user.save();
  
    return res.status(204).send();
  }
}