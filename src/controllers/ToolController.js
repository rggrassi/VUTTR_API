const Tool = require('../models/Tool');
const Yup = require('yup');
const { validate } = require('../utils/validation');
const { Types } = require('mongoose');

const create = async (req, res) => {
  const schema = Yup.object().shape({
    title: Yup.string().required(),
    link: Yup.string().required(),
    description: Yup.string().required(),
    tags: Yup.array()
  });

  const { value, errors } = await validate(req.body, schema);
  if (errors) {
    return res.status(400).json(errors);
  }

  value.user = req.user.id;

  const tool = await Tool.create(value);
  return res.status(201).json(tool);
};

const index = async (req, res) => {
  const filter = req.query.tags
    ? {
        tags: {
          $in: req.query.tags.split(',')
        }
      }
    : {};

  const tools = await Tool
    .find(filter)
    .populate('user');

  return res.json(tools);
};

const remove = async(req, res) => {  
  const tool = await Tool.findById(req.params.id).populate('user');      
  if (!tool) {
    return res.status(404).json({ error: 'Tool not found' });
  }
  if (req.user.role !== 'admin') {
    if (!Types.ObjectId(tool.user._id).equals(Types.ObjectId(req.user.id))) {
      return res.status(401).json({ error: 'Only admins can delete any tool' });
    }
  }    
  
  await Tool.deleteOne({ _id: req.params.id });
  res.status(204).send();
}

module.exports = { create, index, remove }