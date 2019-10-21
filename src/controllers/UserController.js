const User = require("../models/User");
const Yup = require("yup");
const { validate } = require("../utils/validation");

const create = async (req, res) => {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string()
      .email()
      .required(),
    password: Yup.string()
      .required()
      .min(6),
    role: Yup.string()
      .when('$role', (role, field) =>
        role === 'admin' ? field.required() : field
      )  
  });

  const { value, errors } = await validate(req.body, schema, {
    role: req.user.role || ''
  });

  if (errors) {
    return res.status(400).json(errors);
  }
  
  if (!req.user) {
    value.role = 'user'
  }    
  /**
   * Check that the logged in user has administrator permissions to create new users.
   */
  if (req.user && req.user.role === 'user') {
    return res.status(401).json({ error: 'Only admins can create new users.' })
  }  

  const emailExists = await User.findOne({ email: value.email });
  if (emailExists) {
    return res.status(400).json({ error: "Email already taken." });
  }

  const user = await User.create(value);

  return res.status(201).json(user);
};

const update = async (req, res) => {
  const schema = Yup.object().shape({
    name: Yup.string(),
    email: Yup.string().email(),
    oldPassword: Yup.string().min(6),
    password: Yup.string()
      .min(6)
      .when("oldPassword", (oldPassword, field) =>
        oldPassword ? field.required() : field
      ),
    confirmPassword: Yup.string().when("password", (password, field) =>
      password ? field.required().oneOf([Yup.ref("password")]) : field
    ),
    role: Yup.string()
  });

  const { errors, value } = await validate(req.body, schema);
  if (errors) {
    return res.status(400).json(errors);
  }

  /**
   * Check that the logged in user has administrator permissions to update data from other users.
   * Otherwise it can update data only from its own user.
   */
  if (req.user.role === 'user' && req.user.id !== req.params.id) {
    return res.status(401).json({ error: 'Only admins can update any user.' })
  }

  const user = await User.findById(req.user.id);

  if (value.email && value.email !== user.email) {
    const userExists = await User.findOne({ email: value.email });
    if (userExists) {
      return res.status(400).json({ error: "User not available." });
    }
  }

  if (req.body.oldPassword && !(await user.checkPassword(req.body.oldPassword))) {
    return res.status(401).json({ error: "Wrong credentials." });
  }

  user.name = value.name || user.name;
  user.email = value.email || user.email;
  user.password = value.password || user.password;
  if (req.user.role === 'user') {
    user.role = 'user';
  } else {
    user.role = value.role || user.role
  }

  const updatedUser = await user.save();
  return res.json(updatedUser);
};

module.exports = { create, update };