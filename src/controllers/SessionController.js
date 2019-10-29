const User = require("../models/User");
const Yup = require("yup");
const jwt = require("jsonwebtoken");
const { validate } = require("../utils/validation");

const create = async (req, res) => {
  const { email, password } = req.body;

  const schema = Yup.object().shape({
    email: Yup.string()
      .email()
      .required(),
    password: Yup.string()
      .required()
      .min(6)
  });

  const { errors } = await validate(req.body, schema);
  if (errors) {
    return res.status(400).json(errors);
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'Could not find your account' });
  }

  if (!(await user.checkPassword(password))) {
    return res.status(401).json({ message: 'Wrong credentials' });
  }

  const { _id, name, role } = user;

  return res.json({
    user: { _id, name, email, role },
    token: jwt.sign({ _id, name, email, role }, process.env.APP_SECRET, {
      expiresIn: "7d"
    })
  });
};

module.exports = { create };