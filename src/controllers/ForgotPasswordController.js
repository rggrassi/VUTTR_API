const User = require('../models/User');
const crypto = require('crypto');
const Yup = require('yup');
const { validate } = require('../utils/validation');
const sendMail = require('../lib/Mail');
const isAfter = require('date-fns/isAfter');
const subDays = require('date-fns/subDays');

const store = async (req, res) => {
  const schema = Yup.object().shape({
    email: Yup.string()
      .email()
      .required()
  });

  const { value, errors } = await validate(req.body, schema);
  if (errors) {
    return res.status(400).json(errors);
  }

  const user = await User.findOne({ email: value.email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.token = crypto.randomBytes(32).toString('hex');
  user.token_created_at = new Date();

  await user.save();

  await sendMail({
    to: `${user.name} <${user.email}>`,
    subject: 'Reset VUTTR password',
    template: 'forgot_password',
    context: {
      username: user.name,
      link: `${req.body.redirect_url}?token=${user.token}`
    }
  });

  return res.status(204).send();
};

const update = async (req, res) => {
  
  const schema = Yup.object().shape({
    token: Yup.string().required(),
    password: Yup.string()
      .min(6)
      .required()
  });

  const { value, errors } = await validate(req.body, schema);
  if (errors) {
    return res.status(400).json(errors);
  }

  const user = await User.findOne({ token: value.token });
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
  user.password = value.password;

  await user.save();

  return res.status(204).send();
};

module.exports = { store, update }