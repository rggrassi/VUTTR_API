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
    role: Yup.array()
      .required()
      .max(2)
      .of(Yup.string().oneOf(["moderator", "normal"]))
  });

  const { value, errors } = await validate(req.body, schema);
  if (errors) {
    return res.status(400).json(errors);
  }

  const userExists = await User.findOne({ email: value.email });
  if (userExists) {
    return res.status(400).json({ error: "User not available." });
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
    )
  });

  const { errors, value } = await validate(req.body, schema);
  if (errors) {
    return res.status(400).json(errors);
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
  const updatedUser = await user.save();
  return res.json(updatedUser);
};

module.exports = { create, update };
