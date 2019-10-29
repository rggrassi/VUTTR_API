const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ToolSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  tags: [String]  
},
{ 
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model("Tool", ToolSchema);