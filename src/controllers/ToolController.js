const Tool = require('../models/Tool');
const { Types } = require('mongoose');

const create = async (req, res) => {
  req.value.body.user = req.user._id;

  const { _id, title, link, description, tags } = await Tool.create(req.value.body);
  
  return res.status(201).json({ _id, title, link, description, tags });
};

const index = async (req, res) => {
  const filter = req.query.tags
    ? {
        tags: {
          $in: req.query.tags.split(',')
        }
      }
    : {};

  const tools = await Tool.find(filter).populate('user', ['name', 'email']);

  return res.json(tools);
};

const remove = async(req, res) => {  
  const tool = await Tool.findById(req.params.id).populate('user');      
  if (!tool) {
    return res.status(404).json({ message: 'Tool not found' });
  }
  if (req.user.role !== 'admin') {
    if (!Types.ObjectId(tool.user._id).equals(Types.ObjectId(req.user._id))) {
      return res.status(401).json({ message: 'Only admins can delete any tool' });
    }
  }    
  
  await Tool.deleteOne({ _id: req.params.id });
  res.status(204).send();
}

module.exports = { create, index, remove }