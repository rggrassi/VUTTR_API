function extractErrors(errors) {
  return errors.inner.reduce((prev, curr) => {
    if (prev[curr.path]) {
      prev[curr.path].push({ type: curr.type, message: curr.message });
    } else {
      prev[curr.path] = [{ type: curr.type, message: curr.message }];
    }
    return prev;
  }, {});
}

module.exports = (schema, context = {}) => {
  return async (req, res, next) => {
    try {
      const value = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,      
        context: context           
      });
      if (!req.value) { 
        req.value = {};
      }
      req.value['body'] = value;
      next();
    } catch (err) {
      const errors = {
        message: 'Validation fails',
        errors: extractErrors(err)
      }
      return res.status(400).json(errors);
    }
  };
}