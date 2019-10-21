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
  });

  const { value, errors } = await validate(req.body, schema);
  if (errors) {
    return res.status(400).json(errors);
  }  
  
  /**
   * Checks if the user is logged in. 
   * Because only admin users can create new users.
   */
  if (!req.user) {
    value.role = 'user';
  } else if (req.user && req.user.role === 'user') {
    return res.status(401).json({ error: 'Only admins can create new users.' })
  }

  emailExists = await User.findOne({ email: value.email });
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
   * Checks if the user is trying to update data from other users. 
   * Because only admin users have this permission.
   */
  if (req.user.role === 'user' && req.user.id !== req.params.id) {
    return res.status(401).json({ error: 'Only admins can update any user.' });
  }

  /**
   * Force the role to ['user'] if any ordinary user tries to upgrade their role to admin.
   */
  if (req.user.role === 'user') {
    value.role = 'user'
  }

  const user = await User.findById(req.params.id);

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
  user.role = value.role || user.role; 

  const updatedUser = await user.save();
  return res.json(updatedUser);
};

module.exports = { create, update };