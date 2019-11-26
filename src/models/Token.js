const mongoose = require('mongoose');
const { Schema } = mongoose;

const TokenSchema = mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['forgot', 'account']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    required: true
  }
}, { 
  versionKey: false
});

module.exports = mongoose.model('Token', TokenSchema);