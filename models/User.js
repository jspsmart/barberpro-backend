const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nickname: {
    type: String,
    required: true,
    trim: true
  },
  avatar_url: {
    type: String,
    default: ''
  },
  balance: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// 确保openid唯一
UserSchema.index({ openid: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);