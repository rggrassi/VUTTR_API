function extractErrors(err) {
  return err.inner.reduce((prev, curr) => {
    if (prev[curr.path]) {
      prev[curr.path].push({ type: curr.type, message: curr.message });
    } else {
      prev[curr.path] = [{ type: curr.type, message: curr.message }];
    }
    return prev;
  }, {});
}

async function validate(obj, schema, context = {}) {
  return schema
    .validate(obj, {
      abortEarly: false,
      stripUnknown: true,      
      context: context       
    })
    .then(value => {
      return { value, errors: null };
    })
    .catch(err => {
      return {
        errors: {
          message: "Validation fails",
          errors: extractErrors(err)
        },
        value: null
      };
    });
}

module.exports = { validate };
