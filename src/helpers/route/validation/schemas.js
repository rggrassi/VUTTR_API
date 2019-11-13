module.exports = {
  session: Yup.object().shape({
    email: Yup.string()
      .email()
      .required(),
    password: Yup.string()
      .min(6)
      .required()
  }),
  userCreate: Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string()
      .email()
      .required(),
    password: Yup.string()
      .required()
      .min(6)
  }),
  userUpdate: Yup.object().shape({
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
    role: Yup.string().oneOf(["user", "admin"])
  }),
  toolCreate: Yup.object().shape({
    title: Yup.string().required(),
    link: Yup.string().required(),
    description: Yup.string().required(),
    tags: Yup.array()
  }),
  forgotStore: Yup.object().shape({
    email: Yup.string()
      .email()
      .required()
  }),
  forgotUpdate: Yup.object().shape({
    token: Yup.string().required(),
    password: Yup.string()
      .min(6)
      .required()
  })
};