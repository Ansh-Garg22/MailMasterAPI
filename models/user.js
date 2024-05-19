const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  customProperties: [
    {
      title: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
  list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
});

const User = mongoose.model('User', userSchema);
module.exports = User;