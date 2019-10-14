const Tool = require('../models/Tool');
const Yup = require('yup');
const { validate } = require('../utils/validation');

const create = async (req, res) => {
    const schema = Yup.object().shape({
        title: Yup.string().required().min(5),
        link: Yup.string().required(),
        description: Yup.string().required()
    });

    const { value, errors } = await validate(req.body, schema);
    if (errors) {
        return res.status(400).json(errors);
    }

    const tool = await Tool.create(value);
    return res.status(201).json(tool);            
}

const index = async (req, res) => {
    const filter = req.query.tag
      ? {
          tags: {
            $in: req.query.tag.split(",")
          }
        }
      : {};   

    const tools = await Tool.find(filter);

    return res.json(tools);
}

module.exports = { create, index }