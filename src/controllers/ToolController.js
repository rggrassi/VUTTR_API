const Tool = require('../models/Tool');
const Yup = require('yup');
const { validate } = require('../utils/validation');

const create = async (req, res) => {
  const schema = Yup.object().shape({
    title: Yup.string().required(),
    link: Yup.string().required(),
    description: Yup.string().required(),
    user: Yup.string().required()
  });

  const { value, errors } = await validate(req.body, schema);
  if (errors) {
    return res.status(400).json(errors);
  }

  const tool = await Tool.create(value);
  return res.status(201).json(tool);
};

const index = async (req, res) => {
  const filter = req.query.tag
    ? {
        tags: {
          $in: req.query.tag.split(",")
        }
      }
    : {};

  const tools = await Tool
    .find(filter)
    .populate('user');

  return res.json(tools);
};

const remove = async(req, res) => {  
  if (req.user.role !== 'admin') {
    const tool = await Tool.findById(req.params.id).populate('user');    
    if (tool.user._id !== req.user.id) {
      return res.status(401).json({ error: "You don't have permission to delete this tool." }) 
    }
  }    
  
  await Tool.remove({ _id: req.params.id });
  res.status(204).send();
}

module.exports = { create, index, remove }